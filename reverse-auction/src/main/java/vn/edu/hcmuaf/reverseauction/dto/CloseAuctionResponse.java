package vn.edu.hcmuaf.reverseauction.dto;

import java.time.Instant;

public record CloseAuctionResponse(Long orderId, String status, Instant closedAt) {
}
