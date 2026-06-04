package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.reverseauction.dto.OrderResponseDTO;
import vn.edu.hcmuaf.reverseauction.entity.Order;
import vn.edu.hcmuaf.reverseauction.entity.OrderStatus;
import vn.edu.hcmuaf.reverseauction.repository.OrderRepository;
import vn.edu.hcmuaf.reverseauction.repository.ReviewRepository;
import vn.edu.hcmuaf.reverseauction.service.NotificationService;
import vn.edu.hcmuaf.reverseauction.service.OrderService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationService notificationService;

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
    public OrderResponseDTO updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

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

                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
