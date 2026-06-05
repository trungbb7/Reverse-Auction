package vn.edu.hcmuaf.reverseauction.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ComplaintResponse(
        Long complaintId,
        Long orderId,
        String orderCode,
        String productName,
        String buyerName,
        Long buyerId,
        String buyerEmail,
        String sellerName,
        Long sellerId,
        String sellerEmail,
        String orderType,
        BigDecimal finalPrice,
        BigDecimal shippingFee,
        BigDecimal totalAmount,
        String shippingAddress,
        String buyerPhone,
        String reason,
        List<String> evidenceUrls,
        String status,
        String sellerAction,
        String sellerMessage,
        String sellerEvidence,
        String verdict,
        String adminNote,
        String finalAction,
        Instant createdAt,
        Instant updatedAt,
        Instant resolvedAt
) {
}
