package vn.edu.hcmuaf.reverseauction.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.reverseauction.dto.*;
import vn.edu.hcmuaf.reverseauction.dto.request.CreateBidRequestDTO;
import vn.edu.hcmuaf.reverseauction.dto.request.UpdateBidRequestDTO;
import vn.edu.hcmuaf.reverseauction.dto.response.AllBidResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.response.PageResponse;
import vn.edu.hcmuaf.reverseauction.entity.*;
import vn.edu.hcmuaf.reverseauction.exception.CustomException;
import vn.edu.hcmuaf.reverseauction.mapper.BidMapper;
import vn.edu.hcmuaf.reverseauction.repository.*;
import vn.edu.hcmuaf.reverseauction.service.BidService;
import vn.edu.hcmuaf.reverseauction.service.NotificationService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BidServiceImpl implements BidService {
    private final BidRepository bidRepository;
    private final AuctionRequestRepository auctionRequestRepository;
    private final UserRepository userRepository;
    private final BidMapper bidMapper;
    private final NotificationService notificationService;
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public BidResponseDTO update(long id, UpdateBidRequestDTO bid, long sellerId) {
        Bid existing = bidRepository.findById(id).
                orElseThrow(() -> CustomException
                .builder()
                .message("Không tìm thấy bid id")
                .status(HttpStatus.NOT_FOUND)
                .error("Not found")
                .build());

        AuctionRequest auc = existing.getAuction();
        if(auc.getStatus() != AuctionStatus.OPEN) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Invalid status")
                    .message("Phiên đấu giá đã không ở trạng thái mở, không được cập nhật giá")
                    .build();
        }

        if(existing.getSeller().getId() != sellerId) {
            throw CustomException.builder()
                    .status(HttpStatus.FORBIDDEN)
                    .error("Forbidden")
                    .message("Người bán không hợp lệ")
                    .build();
        }

        existing.setBidPrice(bid.getBidPrice());
        Bid saved = bidRepository.save(existing);

        // Notify the buyer of updated bid
        String title = "Cập nhật đề nghị đấu giá";
        String content = String.format("Người bán %s đã cập nhật giá đề nghị thành %,.0fđ cho đấu giá \"%s\"",
                existing.getSeller().getFullName(), bid.getBidPrice(), auc.getTitle());
        notificationService.createAndSendNotification(auc.getBuyer(), title, content, "BID_UPDATED", auc.getId());

        BidResponseDTO dto = bidMapper.toDTO(saved);
        enrichSellerStats(dto, sellerId);
        return dto;
    }

    @Override
    @Transactional
    public AllBidResponseDTO getBidsForAuction(long auctionId) {
        List<Bid> bids = bidRepository.findAllByAuctionId(auctionId);
        List<BidResponseDTO> bidsDTO = bids.stream().map(bid -> {
            BidResponseDTO dto = bidMapper.toDTO(bid);
            enrichSellerStats(dto, bid.getSeller().getId());
            return dto;
        }).toList();
        return new AllBidResponseDTO(bidsDTO);
    }

    @Override
    @Transactional
    public BidResponseDTO getUserBidByAuctionId(long auctionId, long userId) {
        AuctionRequest auc = auctionRequestRepository.findById(auctionId)
                .orElseThrow(() -> CustomException.builder()
                        .error("Not found")
                        .message("Không tim thấy phiên đấu giá!")
                        .status(HttpStatus.NOT_FOUND)
                        .build());

        Bid uBid = auc.getBids().stream().filter((bid) -> bid.getSeller().getId() == userId).findFirst()
                .orElseThrow(() -> CustomException.builder()
                        .error("Not found")
                        .message("Không tim thấy phiên người bán!")
                        .status(HttpStatus.NOT_FOUND)
                        .build());
        
        BidResponseDTO dto = bidMapper.toDTO(uBid);
        enrichSellerStats(dto, userId);
        return dto;
    }

    @Override
    @Transactional
    public BidResponseDTO create(CreateBidRequestDTO requestDTO, long sellerId) {
        AuctionRequest auc = auctionRequestRepository.findById(requestDTO.getAuctionId())
                .orElseThrow(() -> CustomException.builder()
                        .status(HttpStatus.NOT_FOUND)
                        .error("Not found")
                        .message("Không tìm thấy phiên đấu giá")
                        .build());

        // Validate: auction must be OPEN
        if (auc.getStatus() != vn.edu.hcmuaf.reverseauction.entity.AuctionStatus.OPEN) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Invalid status")
                    .message("Phiên đấu giá đã đóng, không thể đặt giá")
                    .build();
        }

        // Validate: seller mustn't have bid on this auction
        if (bidRepository.existsByAuctionIdAndSellerId(requestDTO.getAuctionId(), sellerId)) {
            throw CustomException.builder()
                    .status(HttpStatus.CONFLICT)
                    .error("Duplicate bid")
                    .message("Bạn đã đặt giá cho phiên đấu giá này. Hãy cập nhật giá thay vì tạo mới")
                    .build();
        }

        // Find seller
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> CustomException.builder()
                        .status(HttpStatus.NOT_FOUND)
                        .error("Not found")
                        .message("Không tìm thấy người bán")
                        .build());

        // Save bid
        Bid bid = Bid.builder()
                .auction(auc)
                .seller(seller)
                .bidPrice(requestDTO.getBidPrice())
                .note(requestDTO.getNote())
                .build();
        Bid saved = bidRepository.save(bid);

        // Notify the buyer of new bid
        String title = "Đề nghị mới cho đấu giá của bạn";
        String content = String.format("Người bán %s đã gửi đề nghị với giá %,.0fđ cho đấu giá \"%s\"",
                seller.getFullName(), requestDTO.getBidPrice(), auc.getTitle());
        notificationService.createAndSendNotification(auc.getBuyer(), title, content, "NEW_BID", auc.getId());

        BidResponseDTO dto = bidMapper.toDTO(saved);
        enrichSellerStats(dto, sellerId);
        return dto;
    }

    @Override
    @Transactional
    public PageResponse<BidResponseDTO> getSellerBids(long sellerId, Pageable pageable) {
        Page<Bid> page = bidRepository.findAllBySellerId(sellerId, pageable);
        PageResponse<BidResponseDTO> response = bidMapper.toPageResponse(page);
        if (response.getContent() != null) {
            response.getContent().forEach(dto -> enrichSellerStats(dto, sellerId));
        }
        return response;
    }

    private void enrichSellerStats(BidResponseDTO dto, long sellerId) {
        Double avgRating = reviewRepository.getAvgRatingBySellerId(sellerId);
        Long totalReviews = reviewRepository.countBySellerId(sellerId);

        List<Order> orders = orderRepository.findBySeller_Id(sellerId);
        int totalOrders = orders.size();
        double completionRate = 0.0;
        if (totalOrders > 0) {
            long completedOrders = orders.stream()
                    .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                    .count();
            completionRate = (double) completedOrders / totalOrders * 100.0;
        }

        dto.setSellerRating(avgRating != null ? avgRating : 0.0);
        dto.setSellerTotalReviews(totalReviews != null ? totalReviews.intValue() : 0);
        dto.setSellerTotalOrders(totalOrders);
        dto.setSellerCompletionRate(completionRate);
    }
}
