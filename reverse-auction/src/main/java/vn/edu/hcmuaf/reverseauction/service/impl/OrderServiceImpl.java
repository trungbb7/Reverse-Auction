package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.OrderResponseDTO;
import vn.edu.hcmuaf.reverseauction.entity.Order;
import vn.edu.hcmuaf.reverseauction.entity.OrderStatus;
import vn.edu.hcmuaf.reverseauction.repository.OrderRepository;
import vn.edu.hcmuaf.reverseauction.repository.ReviewRepository;
import vn.edu.hcmuaf.reverseauction.service.OrderService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrdersByUserId(Long uid) {
        List<Order> orders = orderRepository.findByBuyer_Id(uid);
        return orders.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrdersBySellerId(Long sellerId) {
        List<Order> orders = orderRepository.findBySeller_Id(sellerId);
        return orders.stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(Long id) {
        Order order = orderRepository.findWithDetailsById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toDTO(order);
    }

    @Override
    @Transactional
    public OrderResponseDTO updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        return toDTO(order);
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
