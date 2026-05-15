package vn.edu.hcmuaf.reverseauction.dto;

import lombok.Builder;
import lombok.Data;
import vn.edu.hcmuaf.reverseauction.entity.AuctionStatus;
import vn.edu.hcmuaf.reverseauction.entity.Bid;

import java.util.List;

@Data
@Builder
public class AuctionWSResponseDTO {
    private List<BidResponseDTO> bids;
    private AuctionRequestResponseDTO auction;
}
