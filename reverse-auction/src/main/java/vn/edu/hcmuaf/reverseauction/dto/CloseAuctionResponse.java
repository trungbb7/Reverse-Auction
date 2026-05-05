package vn.edu.hcmuaf.reverseauction.dto;

import vn.edu.hcmuaf.reverseauction.entity.OrderStatus;

import java.time.Instant;
import java.time.LocalDateTime;

public record CloseAuctionResponse(Long orderId, OrderStatus status, LocalDateTime closedAt) {
}
