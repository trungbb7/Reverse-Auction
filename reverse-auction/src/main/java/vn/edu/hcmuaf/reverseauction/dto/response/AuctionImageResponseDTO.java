package vn.edu.hcmuaf.reverseauction.dto.response;

import lombok.Builder;

@Builder
public class AuctionImageResponseDTO {
    private Long auctionId;
    private String imageUrl;
}
