package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.OrderResponseDTO;
import vn.edu.hcmuaf.reverseauction.entity.OrderStatus;
import vn.edu.hcmuaf.reverseauction.service.JwtService;
import vn.edu.hcmuaf.reverseauction.service.impl.OrderServiceImpl;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrdersController {

    private final OrderServiceImpl orderServiceImpl;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders(
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7);
        Long userId = jwtService.extractUserId(token);

        return ResponseEntity.ok(orderServiceImpl.getOrdersByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderServiceImpl.getOrderById(id));
    }

    @GetMapping("/seller")
    public ResponseEntity<List<OrderResponseDTO>> getSellerOrders(
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7);
        Long userId = jwtService.extractUserId(token);
        List<OrderResponseDTO> orders = orderServiceImpl.getOrdersBySellerId(userId);
        orders.sort((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()));
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        OrderStatus orderStatus = OrderStatus.valueOf(status);
        return ResponseEntity.ok(orderServiceImpl.updateStatus(id, orderStatus));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        List<OrderResponseDTO> orders = orderServiceImpl.getAllOrders();
        orders.sort((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()));
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}/shipping")
    public ResponseEntity<OrderResponseDTO> updateShipping(
            @PathVariable Long id,
            @RequestParam String address,
            @RequestParam String phone
    ) {
        return ResponseEntity.ok(orderServiceImpl.updateShipping(id, address, phone));
    }

    @PostMapping("/{id}/pay-with-balance")
    public ResponseEntity<OrderResponseDTO> payWithBalance(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(orderServiceImpl.payWithBalance(id));
    }
}
