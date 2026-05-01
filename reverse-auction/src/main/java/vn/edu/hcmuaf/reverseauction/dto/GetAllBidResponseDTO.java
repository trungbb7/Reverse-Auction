package vn.edu.hcmuaf.reverseauction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import vn.edu.hcmuaf.reverseauction.entity.Bid;

import java.util.List;

@Data
@AllArgsConstructor
public class GetAllBidResponseDTO {
    private List<BidResponseDTO> bids;
}
