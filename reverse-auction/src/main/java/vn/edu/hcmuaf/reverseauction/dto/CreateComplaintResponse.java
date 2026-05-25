package vn.edu.hcmuaf.reverseauction.dto;

import java.time.Instant;

public record CreateComplaintResponse(Long complaintId, Long chatRoomId, String status, Instant createdAt) {
}
