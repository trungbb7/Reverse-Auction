package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.reverseauction.dto.OrderResponseDTO;
import vn.edu.hcmuaf.reverseauction.entity.Order;
import vn.edu.hcmuaf.reverseauction.entity.OrderStatus;
import vn.edu.hcmuaf.reverseauction.repository.OrderRepository;
import vn.edu.hcmuaf.reverseauction.service.OrderService;

import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;

    @Override
    public List<OrderResponseDTO> getOrdersByUserId(Long uid) {
        List<Order> orders = orderRepository.findByBuyer_IdOrSeller_Id(uid, uid);
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
        orderRepository.save(order);

        return toDTO(order);
    }
    private OrderResponseDTO toDTO(Order o) {
        return OrderResponseDTO.builder()
                .id(o.getId())
                .code(o.getCode() != null ? o.getCode() : null)
                .type(o.getType().name())

                .productId(o.getProduct() != null ? o.getProduct().getId() : null)
                .productName(o.getProduct() != null ? o.getProduct().getName() : null)

                .buyerId(o.getBuyer().getId())
                .buyerName(o.getBuyer().getFullName())

                .sellerId(o.getSeller().getId())
                .sellerName(o.getSeller().getFullName())

                .finalPrice(o.getFinalPrice())
                .shippingFee(o.getShippingFee())
                .totalAmount(o.getTotalAmount())

                .status(o.getStatus().name())

                .auctionId(o.getAuction() != null ? o.getAuction().getId() : null)
                .bidId(o.getBid() != null ? o.getBid().getId() : null)

                .shippingAddress(o.getShippingAddress())

                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
