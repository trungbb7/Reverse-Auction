package vn.edu.hcmuaf.reverseauction.dto;

import vn.edu.hcmuaf.reverseauction.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

public record OrderResponse(
        Long orderId,
        Long auctionId,
        String productName,
        BigDecimal finalPrice,
        OrderStatus status,
        String buyerName,
        String sellerName,
        LocalDateTime createdAt
) {
}
