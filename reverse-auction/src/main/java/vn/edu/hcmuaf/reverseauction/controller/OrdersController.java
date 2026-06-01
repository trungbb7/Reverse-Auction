package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.dto.OrderResponseDTO;
import vn.edu.hcmuaf.reverseauction.entity.OrderStatus;
import vn.edu.hcmuaf.reverseauction.service.impl.OrderServiceImpl;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrdersController {

    private final OrderServiceImpl orderServiceImpl;

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderServiceImpl.getOrdersByUserId(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderServiceImpl.getOrderById(id));
    }

    @GetMapping("/seller")
    public ResponseEntity<List<OrderResponseDTO>> getSellerOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderServiceImpl.getOrdersBySellerId(user.getId()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        OrderStatus orderStatus = OrderStatus.valueOf(status);
        return ResponseEntity.ok(orderServiceImpl.updateStatus(id, orderStatus));
    }
}
