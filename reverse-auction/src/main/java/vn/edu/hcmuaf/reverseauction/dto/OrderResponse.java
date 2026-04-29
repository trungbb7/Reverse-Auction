package vn.edu.hcmuaf.reverseauction.dto;

import java.time.Instant;

public record OrderResponse(
        Long orderId,
        Long auctionId,
        String productName,
        Long finalPrice,
        String status,
        String buyerName,
        String sellerName,
        Instant createdAt
) {
}
