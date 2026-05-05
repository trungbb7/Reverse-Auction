package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.dto.*;
import vn.edu.hcmuaf.reverseauction.entity.Bid;

public interface BidService {
    BidResponseDTO create(CreateBidRequestDTO bid, long sellerId);
    BidResponseDTO update(long id, UpdateBidRequestDTO bid, long sellerId);
    GetAllBidResponseDTO getBidsForAuction(long auctionId);
    BidResponseDTO getUserBidByAuctionId(long auctionId, long userId);
}
