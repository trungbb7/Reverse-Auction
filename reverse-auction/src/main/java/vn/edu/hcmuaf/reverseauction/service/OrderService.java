package vn.edu.hcmuaf.reverseauction.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.OrderResponse;
import vn.edu.hcmuaf.reverseauction.entity.OrderEntity;
import vn.edu.hcmuaf.reverseauction.repository.order.OrderRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<OrderResponse> listOrders() {
        return orderRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toOrderSummary)
                .toList();
    }

    private OrderResponse toOrderSummary(OrderEntity order) {
        return new OrderResponse(
                order.getId(),
                order.getAuctionId(),
                order.getProductName(),
                order.getFinalPrice(),
                order.getStatus(),
                order.getBuyerName(),
                order.getSellerName(),
                order.getCreatedAt()
        );
    }
}
