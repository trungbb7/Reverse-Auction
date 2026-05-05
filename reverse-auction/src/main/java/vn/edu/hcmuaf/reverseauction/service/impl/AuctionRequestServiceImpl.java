package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.AuctionRequestCreateDTO;
import vn.edu.hcmuaf.reverseauction.dto.AuctionRequestResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.PageResponse;
import vn.edu.hcmuaf.reverseauction.entity.*;
import vn.edu.hcmuaf.reverseauction.exception.CustomException;
import vn.edu.hcmuaf.reverseauction.exception.ResourceNotFoundException;
import vn.edu.hcmuaf.reverseauction.mapper.AuctionRequestMapper;
import vn.edu.hcmuaf.reverseauction.repository.AuctionRequestRepository;
import vn.edu.hcmuaf.reverseauction.repository.BidRepository;
import vn.edu.hcmuaf.reverseauction.repository.CategoryRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.repository.specification.AuctionRequestSpecification;
import vn.edu.hcmuaf.reverseauction.service.AuctionRequestService;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuctionRequestServiceImpl implements AuctionRequestService {

    private final AuctionRequestRepository auctionRequestRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AuctionRequestMapper auctionRequestMapper;

    @Override
    public AuctionRequestResponseDTO createAuctionRequest(AuctionRequestCreateDTO requestDTO, String email) {
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Category category = categoryRepository.findById(requestDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + requestDTO.getCategoryId()));

        AuctionRequest auctionRequest = AuctionRequest.builder()
                .buyer(buyer)
                .category(category)
                .title(requestDTO.getTitle())
                .description(requestDTO.getDescription())
                .quantity(requestDTO.getQuantity())
                .budgetMax(requestDTO.getBudgetMax())
                .endDate(requestDTO.getEndDate())
                .status(AuctionStatus.OPEN)
                .build();

        AuctionRequest savedAuctionRequest = auctionRequestRepository.save(auctionRequest);

        return auctionRequestMapper.toDTO(savedAuctionRequest);
    }

    @Override
    public PageResponse<AuctionRequestResponseDTO> getAllAuctionRequests(Pageable pageable) {
        Page<AuctionRequest> page = auctionRequestRepository.findAll(pageable);
        return auctionRequestMapper.toPageResponse(page);
    }

    @Override
    public PageResponse<AuctionRequestResponseDTO> getMyAuctionRequests(String email, Pageable pageable) {
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Page<AuctionRequest> page = auctionRequestRepository.findByBuyer(buyer, pageable);
        return auctionRequestMapper.toPageResponse(page);
    }

    @Override
    public AuctionRequestResponseDTO findById(long id) {
        AuctionRequest auc = auctionRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        return auctionRequestMapper.toDTO(auc);
    }

    @Override
    @Transactional
    public AuctionRequestResponseDTO selectWinner(long auctionId, long bidId, String buyerEmail) {
        // 1. Find auction
        AuctionRequest auction = auctionRequestRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy auction id: " + auctionId));

        // 2. Check: auction must be CLOSED to select winner
        if (auction.getStatus() != AuctionStatus.CLOSED) {
            throw CustomException.builder()
                    .statusCode(HttpStatus.BAD_REQUEST)
                    .error("Invalid status")
                    .message("Chỉ có thể chọn winner khi auction đã CLOSED. Trạng thái hiện tại: " + auction.getStatus())
                    .build();
        }

        // 3. Check: API requester must be owner of auction
        if (!auction.getBuyer().getEmail().equals(buyerEmail)) {
            throw CustomException.builder()
                    .statusCode(HttpStatus.FORBIDDEN)
                    .error("Forbidden")
                    .message("Bạn không có quyền chọn winner cho auction này")
                    .build();
        }

        // 4. Find winner bid
        Bid winnerBid = bidRepository.findById(bidId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bid id: " + bidId));

        // 5. Check if bid along with auction
        if (winnerBid.getAuction().getId() != auctionId) {
            throw CustomException.builder()
                    .statusCode(HttpStatus.BAD_REQUEST)
                    .error("Invalid bid")
                    .message("Bid này không thuộc auction id: " + auctionId)
                    .build();
        }

        // 6. Set winner state
        auction.getBids().forEach(bid -> bid.setIsWinner(false));
        winnerBid.setIsWinner(true);
        bidRepository.saveAll(auction.getBids());

        // 7. Set auction state
        auction.setStatus(AuctionStatus.COMPLETED);
        AuctionRequest saved = auctionRequestRepository.save(auction);

        return auctionRequestMapper.toDTO(saved);
    }

    @Override
    public PageResponse<AuctionRequestResponseDTO> getFilteredAuction(String keyword, String categoryName, AuctionStatus status, BigDecimal minBudget, BigDecimal maxBudget, Pageable pageable) {
        Specification<AuctionRequest> spec = Specification.where(AuctionRequestSpecification.hasCategoryName(categoryName))
                .and(AuctionRequestSpecification.hasStatus(status))
                .and(AuctionRequestSpecification.inBudgetRange(minBudget, maxBudget))
                .and(AuctionRequestSpecification.hasKeyword(keyword));

        Page<AuctionRequest> page = auctionRequestRepository.findAll(spec, pageable);
        return auctionRequestMapper.toPageResponse(page);
    }
}
