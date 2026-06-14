package vn.edu.hcmuaf.reverseauction.dto.response;

import java.math.BigDecimal;

public record CheckoutResponse (
    Long paymentId,
    String sessionCode,
    BigDecimal totalAmount,
    String paymentUrl,
    String status
    ){}
