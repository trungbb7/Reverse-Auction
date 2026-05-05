package vn.edu.hcmuaf.reverseauction.dto;

import java.time.Instant;
import java.util.List;

public record ComplaintResponse(
        Long complaintId,
        Long orderId,
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
