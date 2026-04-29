package vn.edu.hcmuaf.reverseauction.service;

import org.springframework.data.domain.Pageable;
import vn.edu.hcmuaf.reverseauction.dto.AuctionRequestCreateDTO;
import vn.edu.hcmuaf.reverseauction.dto.AuctionRequestResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.PageResponse;

public interface AuctionRequestService {
    AuctionRequestResponseDTO createAuctionRequest(AuctionRequestCreateDTO requestDTO, String username);
    PageResponse<AuctionRequestResponseDTO> getAllAuctionRequests(Pageable pageable);
    PageResponse<AuctionRequestResponseDTO> getMyAuctionRequests(String username, Pageable pageable);
    AuctionRequestResponseDTO findById(long id);
}
