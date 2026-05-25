package vn.edu.hcmuaf.reverseauction.dto;

import vn.edu.hcmuaf.reverseauction.entity.ComplaintStatus;

import java.time.Instant;
import java.util.List;

public record ComplaintResponse(
        Long complaintId,
        Long buyerId,
        String buyerName,
        Long orderId,
        String orderCode,
        Long chatRoomId,
        String content,
        List<String> attachmentUrls,
        ComplaintStatus status,
        Instant createdAt,
        Instant updatedAt,
        Instant resolvedAt
) {
}
