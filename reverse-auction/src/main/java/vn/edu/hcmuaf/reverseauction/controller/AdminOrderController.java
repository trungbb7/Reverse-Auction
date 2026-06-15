package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.OrderResponseDTO;
import vn.edu.hcmuaf.reverseauction.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}
