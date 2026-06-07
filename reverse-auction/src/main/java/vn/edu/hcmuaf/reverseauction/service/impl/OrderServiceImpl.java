package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import vn.edu.hcmuaf.reverseauction.dto.OrderResponseDTO;
import vn.edu.hcmuaf.reverseauction.entity.Order;
import vn.edu.hcmuaf.reverseauction.entity.OrderStatus;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.entity.SystemSetting;
import vn.edu.hcmuaf.reverseauction.exception.CustomException;
import vn.edu.hcmuaf.reverseauction.repository.OrderRepository;
import vn.edu.hcmuaf.reverseauction.repository.ReviewRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.repository.SystemSettingRepository;
import vn.edu.hcmuaf.reverseauction.service.NotificationService;
import vn.edu.hcmuaf.reverseauction.service.OrderService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final SystemSettingRepository systemSettingRepository;

    @Override
    public List<OrderResponseDTO> getOrdersByUserId(Long uid) {
        List<Order> orders = orderRepository.findByBuyer_Id(uid);
        return orders.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<OrderResponseDTO> getOrdersBySellerId(Long sellerId) {
        List<Order> orders = orderRepository.findBySeller_Id(sellerId);
        return orders.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public OrderResponseDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toDTO(order);
    }

    @Override
    @Transactional
    public OrderResponseDTO updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (status == OrderStatus.COMPLETED && order.getStatus() != OrderStatus.COMPLETED) {
            BigDecimal commRate = systemSettingRepository.findById("COMMISSION_RATE")
                    .map(s -> {
                        try {
                            return new BigDecimal(s.getValue());
                        } catch (Exception e) {
                            return BigDecimal.valueOf(10);
                        }
                    })
                    .orElse(BigDecimal.valueOf(10));
            BigDecimal totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
            BigDecimal commAmount = totalAmount.multiply(commRate).divide(BigDecimal.valueOf(100));
            BigDecimal sellerEarnings = totalAmount.subtract(commAmount);

            order.setCommissionRate(commRate);
            order.setCommissionAmount(commAmount);

            User seller = order.getSeller();
            if (seller.getBalance() == null) {
                seller.setBalance(BigDecimal.ZERO);
            }
            seller.setBalance(seller.getBalance().add(sellerEarnings));
            userRepository.save(seller);
        }

        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        // Send notifications based on status changes
        String orderTitle = order.getAuction() != null ? order.getAuction().getTitle() : (order.getProduct() != null ? order.getProduct().getName() : "sản phẩm");
        String title = "";
        String content = "";

        switch (status) {
            case SHIPPED:
                title = "Đơn hàng đang được giao";
                content = String.format("Đơn hàng %s cho \"%s\" đã được chuyển giao cho đơn vị vận chuyển.", order.getCode(), orderTitle);
                notificationService.createAndSendNotification(order.getBuyer(), title, content, "ORDER_STATUS_CHANGED", order.getId());
                break;
            case DELIVERED:
                title = "Đơn hàng đã giao thành công";
                content = String.format("Đơn hàng %s cho \"%s\" đã được giao thành công. Vui lòng kiểm tra và xác nhận.", order.getCode(), orderTitle);
                notificationService.createAndSendNotification(order.getBuyer(), title, content, "ORDER_STATUS_CHANGED", order.getId());
                break;
            case COMPLETED:
                title = "Đơn hàng đã hoàn thành";
                content = String.format("Đơn hàng %s cho \"%s\" đã hoàn thành thành công.", order.getCode(), orderTitle);
                notificationService.createAndSendNotification(order.getSeller(), title, content, "ORDER_STATUS_CHANGED", order.getId());
                break;
            case CANCELLED:
                title = "Đơn hàng đã bị huỷ";
                content = String.format("Đơn hàng %s cho \"%s\" đã bị huỷ.", order.getCode(), orderTitle);
                notificationService.createAndSendNotification(order.getBuyer(), title, content, "ORDER_STATUS_CHANGED", order.getId());
                notificationService.createAndSendNotification(order.getSeller(), title, content, "ORDER_STATUS_CHANGED", order.getId());
                break;
            default:
                break;
        }

        return toDTO(savedOrder);
    }
    @Override
    public List<OrderResponseDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream().map(this::toDTO).collect(Collectors.toList());
    }
    private OrderResponseDTO toDTO(Order o) {
        // For AUCTION orders, fallback to auction title/image when no product
        String productName = o.getProduct() != null
                ? o.getProduct().getName()
                : (o.getAuction() != null ? o.getAuction().getTitle() : null);
        String imageUrl = o.getProduct() != null
                ? o.getProduct().getImageUrl()
                : null;
        String auctionTitle = o.getAuction() != null ? o.getAuction().getTitle() : null;

        return OrderResponseDTO.builder()
                .id(o.getId())
                .code(o.getCode() != null ? o.getCode() : null)
                .type(o.getType().name())

                .productId(o.getProduct() != null ? o.getProduct().getId() : null)
                .productName(productName)
                .imageUrl(imageUrl)
                .brand(o.getProduct() != null ? o.getProduct().getBrand() : null)

                .buyerId(o.getBuyer().getId())
                .buyerName(o.getBuyer().getFullName())

                .sellerId(o.getSeller().getId())
                .sellerName(o.getSeller().getFullName())

                .finalPrice(o.getFinalPrice())
                .shippingFee(o.getShippingFee())
                .buyerPhone(o.getBuyerPhone())
                .totalAmount(o.getTotalAmount())

                .status(o.getStatus().name())
                .alreadyReviewed(reviewRepository.existsByOrderId(o.getId()))

                .auctionId(o.getAuction() != null ? o.getAuction().getId() : null)
                .bidId(o.getBid() != null ? o.getBid().getId() : null)
                .auctionTitle(auctionTitle)

                .shippingAddress(o.getShippingAddress())
                .commissionRate(o.getCommissionRate())
                .commissionAmount(o.getCommissionAmount())

                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public OrderResponseDTO updateShipping(Long orderId, String address, String phone) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        order.setShippingAddress(address);
        order.setBuyerPhone(phone);
        order.setUpdatedAt(LocalDateTime.now());
        Order saved = orderRepository.save(order);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public OrderResponseDTO payWithBalance(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (order.getStatus() != OrderStatus.AWAITING_PAYMENT) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Đơn hàng này không ở trạng thái chờ thanh toán")
                    .build();
        }

        User buyer = order.getBuyer();
        BigDecimal totalAmount = order.getTotalAmount();

        if (buyer.getBalance() == null || buyer.getBalance().compareTo(totalAmount) < 0) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Số dư tài khoản không đủ để thanh toán")
                    .build();
        }

        // Deduct balance from buyer
        buyer.setBalance(buyer.getBalance().subtract(totalAmount));
        userRepository.save(buyer);

        // Update order status to PAID
        order.setStatus(OrderStatus.PAID);
        order.setUpdatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        // Send notifications (identical to VNPay callback success)
        String orderTitle = order.getAuction() != null ? order.getAuction().getTitle() : (order.getProduct() != null ? order.getProduct().getName() : "sản phẩm");

        // Notify buyer
        notificationService.createAndSendNotification(
                order.getBuyer(),
                "Thanh toán đơn hàng thành công",
                String.format("Thanh toán cho đơn hàng %s (\"%s\") đã được xác nhận thành công từ số dư ví.", order.getCode(), orderTitle),
                "ORDER_STATUS_CHANGED",
                order.getId()
        );

        // Notify seller
        notificationService.createAndSendNotification(
                order.getSeller(),
                "Đơn hàng mới đã được thanh toán",
                String.format("Đơn hàng %s (\"%s\") đã được người mua thanh toán bằng số dư ví. Vui lòng chuẩn bị và giao hàng.", order.getCode(), orderTitle),
                "ORDER_STATUS_CHANGED",
                order.getId()
        );

        return toDTO(savedOrder);
    }
}
