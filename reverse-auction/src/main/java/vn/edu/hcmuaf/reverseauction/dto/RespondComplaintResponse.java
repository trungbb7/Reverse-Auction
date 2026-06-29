package vn.edu.hcmuaf.reverseauction.dto;

import vn.edu.hcmuaf.reverseauction.entity.ComplaintStatus;

import java.time.Instant;

public record RespondComplaintResponse(
        Long complaintId,
        ComplaintStatus status,
        String sellerAction,
        String sellerMessage,
        String sellerEvidence,
        Instant updatedAt
) {
}
