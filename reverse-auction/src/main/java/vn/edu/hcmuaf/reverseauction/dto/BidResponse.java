package vn.edu.hcmuaf.reverseauction.dto;

import java.math.BigDecimal;

public record BidResponse(
        Long bidId,
        Long sellerId,
//        String sellerName,
        BigDecimal bidPrice,
        String bidMessage
//        String productDetail
) {
}
