package vn.edu.hcmuaf.reverseauction.service;

import org.springframework.data.domain.Pageable;
import vn.edu.hcmuaf.reverseauction.dto.AuctionRequestCreateDTO;
import vn.edu.hcmuaf.reverseauction.dto.AuctionRequestResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.PageResponse;
import vn.edu.hcmuaf.reverseauction.entity.AuctionStatus;

import java.math.BigDecimal;

public interface AuctionRequestService {
    AuctionRequestResponseDTO createAuctionRequest(AuctionRequestCreateDTO requestDTO, String username);
    PageResponse<AuctionRequestResponseDTO> getAllAuctionRequests(Pageable pageable);
    PageResponse<AuctionRequestResponseDTO> getMyAuctionRequests(String username, Pageable pageable);
    PageResponse<AuctionRequestResponseDTO> getFilteredAuction(String keyword, String categoryName, AuctionStatus status, BigDecimal minBudget, BigDecimal maxBudget, Pageable pageable);
    AuctionRequestResponseDTO findById(long id);
    AuctionRequestResponseDTO selectWinner(long auctionId, long bidId, String buyerEmail);
}
