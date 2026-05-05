package vn.edu.hcmuaf.reverseauction.dto;

import java.time.Instant;

public record MessageResponse(Long msgId, Long receiverId, Long auctionId, String content, Instant time) {
}
