package vn.edu.hcmuaf.reverseauction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AuctionResponse(
        Long auctionId,
        String title,
        String description,
        BigDecimal budgetMax,
        String status,
        Long currentLowestPrice,
        LocalDateTime endDate,
        List<BidResponse> bids
) {
}
