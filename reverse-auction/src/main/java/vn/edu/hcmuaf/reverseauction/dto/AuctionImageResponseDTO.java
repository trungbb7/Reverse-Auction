package vn.edu.hcmuaf.reverseauction.dto;

import lombok.Builder;

@Builder
public class AuctionImageResponseDTO {
    private Long auctionId;
    private String imageUrl;
}
