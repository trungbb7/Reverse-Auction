package vn.edu.hcmuaf.reverseauction.dto;

import java.time.Instant;

public record CreateComplaintResponse(Long complaintId, Long orderId, String status, Instant createdAt) {
}
