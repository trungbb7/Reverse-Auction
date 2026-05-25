package vn.edu.hcmuaf.reverseauction.dto.response;

import lombok.Builder;
import lombok.Data;
import vn.edu.hcmuaf.reverseauction.dto.AuctionRequestResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.BidResponseDTO;

import java.util.List;

@Data
@Builder
public class AuctionWSResponseDTO {
    private List<BidResponseDTO> bids;
    private AuctionRequestResponseDTO auction;
}
