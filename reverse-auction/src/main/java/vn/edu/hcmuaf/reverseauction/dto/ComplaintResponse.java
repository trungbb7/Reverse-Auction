package vn.edu.hcmuaf.reverseauction.dto;

import vn.edu.hcmuaf.reverseauction.entity.ComplaintStatus;
import vn.edu.hcmuaf.reverseauction.entity.Verdict;

import java.time.Instant;
import java.util.List;

public record ComplaintResponse(
        Long complaintId,
        Long orderId,
        String orderCode,
        String productName,
        Long buyerId,
        String buyerName,
        Long sellerId,
        String sellerName,
        String reason,
        List<String> evidenceUrls,
        ComplaintStatus status,
        String sellerAction,
        String sellerMessage,
        String sellerEvidence,
        Verdict verdict,
        String adminNote,
        String finalAction,
        Instant createdAt,
        Instant updatedAt,
        Instant resolvedAt
) {
}
