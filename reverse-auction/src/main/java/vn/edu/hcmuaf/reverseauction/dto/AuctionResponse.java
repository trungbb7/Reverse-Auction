package vn.edu.hcmuaf.reverseauction.dto;

import java.time.Instant;
import java.util.List;

public record AuctionResponse(
        Long auctionId,
        String title,
        String description,
        Long budgetMax,
        String status,
        Long currentLowestPrice,
        Instant endDate,
        List<BidResponse> bids
) {
}
