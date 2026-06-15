package vn.edu.hcmuaf.reverseauction.service;

import org.springframework.data.domain.Pageable;
import vn.edu.hcmuaf.reverseauction.dto.*;
import vn.edu.hcmuaf.reverseauction.dto.request.CreateBidRequestDTO;
import vn.edu.hcmuaf.reverseauction.dto.request.UpdateBidRequestDTO;
import vn.edu.hcmuaf.reverseauction.dto.response.AllBidResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.response.PageResponse;

public interface BidService {
    BidResponseDTO create(CreateBidRequestDTO bid, long sellerId);
    BidResponseDTO update(long id, UpdateBidRequestDTO bid, long sellerId);
    AllBidResponseDTO getBidsForAuction(long auctionId);
    BidResponseDTO getUserBidByAuctionId(long auctionId, long userId);
    PageResponse<BidResponseDTO> getSellerBids(long sellerId, Pageable pageable);
}
