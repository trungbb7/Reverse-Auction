package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.request.CheckoutRequest;
import vn.edu.hcmuaf.reverseauction.dto.response.CheckoutResponse;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.service.PaymentSessionService;
import vn.edu.hcmuaf.reverseauction.service.impl.CheckoutServiceImpl;
import vn.edu.hcmuaf.reverseauction.service.impl.PaymentSessionServiceImpl;

import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {
    private final CheckoutServiceImpl checkoutServiceImpl;
    private final PaymentSessionServiceImpl paymentSessionServiceImpl;
    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(
            @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(
                checkoutServiceImpl.checkout(request, user)
        );
    }

    @PostMapping("/vnpay/callback")
    public ResponseEntity<Map<String, String>> handleCallback(
            @RequestParam String sessionCode,
            @RequestParam String status) {
        paymentSessionServiceImpl.handleCallback(sessionCode, status);
        return ResponseEntity.ok(Map.of(
                "sessionCode", sessionCode,
                "status", status,
                "message", "success".equalsIgnoreCase(status)
                        ? "Thanh toán thành công, đơn hàng đã được cập nhật."
                        : "Thanh toán thất bại, vui lòng thử lại."
        ));
    }
}
