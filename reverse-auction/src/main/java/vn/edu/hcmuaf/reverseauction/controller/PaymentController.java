package vn.edu.hcmuaf.reverseauction.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.CreatePaymentRequest;
import vn.edu.hcmuaf.reverseauction.dto.PaymentResponse;
import vn.edu.hcmuaf.reverseauction.service.impl.PaymentService;

import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payment")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping("/vnpay")
    public ResponseEntity<PaymentResponse> createPayment(@RequestBody CreatePaymentRequest request) throws NoSuchAlgorithmException, InvalidKeyException {
        return ResponseEntity.ok(paymentService.createPayment(request));
    }


    @PostMapping("/vnpay/callback")
    public ResponseEntity<Map<String, String>> handleCallback(
            @RequestParam Long orderId,
            @RequestParam String status) {
        paymentService.handleCallback(orderId, status);
        return ResponseEntity.ok(Map.of(
                "orderId", orderId.toString(),
                "status", status,
                "message", "success".equalsIgnoreCase(status)
                        ? "Thanh toán thành công, đơn hàng đã được cập nhật."
                        : "Thanh toán thất bại, vui lòng thử lại."
        ));
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> listPayments() {
        return ResponseEntity.ok(paymentService.listPayments());
    }
}
