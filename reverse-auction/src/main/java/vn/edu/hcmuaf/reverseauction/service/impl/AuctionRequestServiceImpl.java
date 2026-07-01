package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.request.AuctionRequestCreateDTO;
import vn.edu.hcmuaf.reverseauction.dto.AuctionRequestResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.response.PageResponse;
import vn.edu.hcmuaf.reverseauction.entity.*;
import vn.edu.hcmuaf.reverseauction.exception.CustomException;
import vn.edu.hcmuaf.reverseauction.exception.ResourceNotFoundException;
import vn.edu.hcmuaf.reverseauction.mapper.AuctionRequestMapper;
import vn.edu.hcmuaf.reverseauction.repository.*;
import vn.edu.hcmuaf.reverseauction.repository.specification.AuctionRequestSpecification;
import vn.edu.hcmuaf.reverseauction.service.AuctionRequestService;
import vn.edu.hcmuaf.reverseauction.service.NotificationService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuctionRequestServiceImpl implements AuctionRequestService {

    private final AuctionRequestRepository auctionRequestRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AuctionRequestMapper auctionRequestMapper;
    private final OrderRepository orderRepository;
    private final AuctionImageRepository auctionImageRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
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

        for (String imageUrl: requestDTO.getImageUrls()) {
            AuctionImage auctionImage = AuctionImage.builder()
                    .imageUrl(imageUrl)
                    .auction(auctionRequest)
                    .build();

            auctionRequest.getAuctionImages().add(auctionImage);
        }

        AuctionRequest savedAuctionRequest = auctionRequestRepository.save(auctionRequest);

        return enrichBuyerStats(auctionRequestMapper.toDTO(savedAuctionRequest));
    }

    @Override
    @Transactional
    public PageResponse<AuctionRequestResponseDTO> getAllAuctionRequests(Pageable pageable) {
        Page<AuctionRequest> page = auctionRequestRepository.findAll(pageable);
        PageResponse<AuctionRequestResponseDTO> response = auctionRequestMapper.toPageResponse(page);
        if (response.getContent() != null) {
            response.getContent().forEach(this::enrichBuyerStats);
        }
        return response;
    }

    @Override
    @Transactional
    public PageResponse<AuctionRequestResponseDTO> getMyAuctionRequests(String email, Pageable pageable) {
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Page<AuctionRequest> page = auctionRequestRepository.findByBuyer(buyer, pageable);
        PageResponse<AuctionRequestResponseDTO> response = auctionRequestMapper.toPageResponse(page);
        if (response.getContent() != null) {
            response.getContent().forEach(this::enrichBuyerStats);
        }
        return response;
    }

    @Override
    @Transactional
    public AuctionRequestResponseDTO findById(long id) {
        AuctionRequest auc = auctionRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        return enrichBuyerStats(auctionRequestMapper.toDTO(auc));
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
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Invalid status")
                    .message("Chỉ có thể chọn winner khi auction đã CLOSED. Trạng thái hiện tại: " + auction.getStatus())
                    .build();
        }

        // 3. Check: API requester must be owner of auction
        if (!auction.getBuyer().getEmail().equals(buyerEmail)) {
            throw CustomException.builder()
                    .status(HttpStatus.FORBIDDEN)
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
                    .status(HttpStatus.BAD_REQUEST)
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

        // 8. Create Order for buyer and seller
        String orderCode = "AUC-" + auctionId + "-" + System.currentTimeMillis();
        Order order = Order.builder()
                .code(orderCode)
                .type(OrderType.BID)
                .auction(saved)
                .bid(winnerBid)
                .buyer(auction.getBuyer())
                .seller(winnerBid.getSeller())
                .subtotal(winnerBid.getBidPrice())
                .finalPrice(winnerBid.getBidPrice())
                .shippingFee(BigDecimal.ZERO)
                .totalAmount(winnerBid.getBidPrice())
                .status(OrderStatus.AWAITING_PAYMENT)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        Order savedOder = orderRepository.save(order);

        // Notify the winning seller
        String title = "Đề nghị đấu giá của bạn đã thắng!";
        String content = String.format("Chúc mừng! Đề nghị đấu giá với giá %,.0fđ cho \"%s\" đã được chọn làm người thắng. Đơn hàng %s đã được tạo.",
                winnerBid.getBidPrice(), auction.getTitle(), orderCode);
        notificationService.createAndSendNotification(winnerBid.getSeller(), title, content, "AUCTION_WON", auction.getId());

        AuctionRequestResponseDTO dto = enrichBuyerStats(auctionRequestMapper.toDTO(saved));
        dto.setOrderId(savedOder.getId());
        return dto;
    }

    @Override
    @Transactional
    public AuctionRequestResponseDTO updateAuctionStatus(long auctionId, AuctionStatus status, Long buyerId) {
        AuctionRequest auction = auctionRequestRepository.findById(auctionId).orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy auction Id: " + auctionId));

        User user = userRepository.findById(buyerId).orElseThrow(
                () -> new ResourceNotFoundException("Không tìm thấy người dùng: " + buyerId));

        boolean isBuyer = auction.getBuyer().getId().equals(buyerId);
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        if (!isBuyer && !isAdmin) {
            throw CustomException.builder()
                    .error("Forbidden")
                    .message("Bạn không có quyền cập nhật trạng thái phiên đấu giá này")
                    .status(HttpStatus.FORBIDDEN)
                    .build();
        }

        if (auction.getStatus() == AuctionStatus.COMPLETED || auction.getStatus() == AuctionStatus.CANCELLED) {
            throw CustomException.builder()
                    .error("Bad Request")
                    .message("Không thể cập nhật trạng thái cho phiên đấu giá đã kết thúc hoặc đã hủy")
                    .status(HttpStatus.BAD_REQUEST)
                    .build();
        }

        auction.setStatus(status);

        auctionRequestRepository.save(auction);

        return enrichBuyerStats(auctionRequestMapper.toDTO(auction));
    }

    @Override
    @Transactional
    public PageResponse<AuctionRequestResponseDTO> getFilteredAuction(String keyword, String categoryName, AuctionStatus status, BigDecimal minBudget, BigDecimal maxBudget, Pageable pageable) {
        Specification<AuctionRequest> spec = Specification.where(AuctionRequestSpecification.hasCategoryName(categoryName))
                .and(AuctionRequestSpecification.hasStatus(status))
                .and(AuctionRequestSpecification.inBudgetRange(minBudget, maxBudget))
                .and(AuctionRequestSpecification.hasKeyword(keyword));

        Page<AuctionRequest> page = auctionRequestRepository.findAll(spec, pageable);
        PageResponse<AuctionRequestResponseDTO> response = auctionRequestMapper.toPageResponse(page);
        if (response.getContent() != null) {
            response.getContent().forEach(this::enrichBuyerStats);
        }
        return response;
    }

    private AuctionRequestResponseDTO enrichBuyerStats(AuctionRequestResponseDTO dto) {
        if (dto == null || dto.getBuyerId() == null) return dto;
        List<Order> orders = orderRepository.findByBuyer_Id(dto.getBuyerId());
        int totalOrders = orders.size();
        double completionRate = 0.0;
        if (totalOrders > 0) {
            long completedOrders = orders.stream()
                    .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                    .count();
            completionRate = (double) completedOrders / totalOrders * 100.0;
        }
        dto.setBuyerTotalOrders(totalOrders);
        dto.setBuyerCompletionRate(completionRate);
        return dto;
    }
}
