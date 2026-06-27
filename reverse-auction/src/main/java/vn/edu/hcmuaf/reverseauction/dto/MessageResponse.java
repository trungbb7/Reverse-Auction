package vn.edu.hcmuaf.reverseauction.dto;

import java.time.Instant;

public record MessageResponse(Long msgId, Long senderId, String senderName, Long receiverId, Long auctionId, String content, String type, String url, Instant time) {
}
