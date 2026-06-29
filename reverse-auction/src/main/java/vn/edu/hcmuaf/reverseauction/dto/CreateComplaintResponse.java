package vn.edu.hcmuaf.reverseauction.dto;

import vn.edu.hcmuaf.reverseauction.entity.ComplaintStatus;

import java.time.Instant;

public record CreateComplaintResponse(Long complaintId, Long orderId, ComplaintStatus status, Instant createdAt) {
}
