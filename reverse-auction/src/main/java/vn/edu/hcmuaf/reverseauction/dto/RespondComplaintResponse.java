package vn.edu.hcmuaf.reverseauction.dto;

import java.time.Instant;

public record RespondComplaintResponse(
        Long complaintId,
        String status,
        String sellerAction,
        String sellerMessage,
        String sellerEvidence,
        Instant updatedAt
) {
}
