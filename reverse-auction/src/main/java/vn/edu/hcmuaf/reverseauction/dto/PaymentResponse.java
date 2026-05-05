package vn.edu.hcmuaf.reverseauction.dto;

import java.time.Instant;

public record PaymentResponse(
        Long paymentId,
        Long orderId,
        Long amount,
        String bankCode,
        String paymentUrl,
        Instant createdAt
) {
}
