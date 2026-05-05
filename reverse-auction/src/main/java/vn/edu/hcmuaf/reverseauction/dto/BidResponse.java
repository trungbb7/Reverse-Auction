package vn.edu.hcmuaf.reverseauction.dto;

public record BidResponse(
        Long bidId,
        Long sellerId,
        String sellerName,
        Long bidPrice,
        String bidMessage,
        String productDetail
) {
}
