package vn.edu.hcmuaf.reverseauction.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import vn.edu.hcmuaf.reverseauction.dto.BidResponseDTO;

import java.util.List;

@Data
@AllArgsConstructor
public class AllBidResponseDTO {
    private List<BidResponseDTO> bids;
}
