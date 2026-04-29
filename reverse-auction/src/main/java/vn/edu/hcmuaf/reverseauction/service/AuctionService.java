package vn.edu.hcmuaf.reverseauction.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.AuctionResponse;
import vn.edu.hcmuaf.reverseauction.dto.BidResponse;
import vn.edu.hcmuaf.reverseauction.dto.CloseAuctionRequest;
import vn.edu.hcmuaf.reverseauction.dto.CloseAuctionResponse;
import vn.edu.hcmuaf.reverseauction.entity.AuctionEntity;
import vn.edu.hcmuaf.reverseauction.entity.BidEntity;
import vn.edu.hcmuaf.reverseauction.entity.OrderEntity;
import vn.edu.hcmuaf.reverseauction.repository.auction.AuctionRepository;
import vn.edu.hcmuaf.reverseauction.repository.order.OrderRepository;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuctionService {
    private final AuctionRepository auctionRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<AuctionResponse> listAuctions() {
        return auctionRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toAuctionSummary)
                .toList();
    }

    @Transactional
    public CloseAuctionResponse closeAuction(Long auctionId, CloseAuctionRequest request) {
        AuctionEntity auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new IllegalArgumentException("Auction not found: " + auctionId));
        if (!"OPEN".equalsIgnoreCase(auction.getStatus())) {
            throw new IllegalStateException("Auction is already closed");
        }

        BidEntity selectedBid = auction.getBids().stream()
                .filter(bid -> bid.getId() != null && bid.getId().equals(request.selectedBidId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Selected bid not found"));

        auction.setStatus("CLOSED");
        auctionRepository.save(auction);

        OrderEntity order = new OrderEntity();
        order.setAuctionId(auction.getId());
        order.setProductName(selectedBid.getProductDetail());
        order.setFinalPrice(selectedBid.getBidPrice());
        order.setStatus("CLOSED");
        order.setBuyerName(auction.getBuyerName());
        order.setSellerName(selectedBid.getSellerName());
        order.setCreatedAt(Instant.now());
        order = orderRepository.save(order);

        return new CloseAuctionResponse(order.getId(), order.getStatus(), Instant.now());
    }

    private AuctionResponse toAuctionSummary(AuctionEntity auction) {
        Long currentLowestPrice = auction.getBids().stream()
                .map(BidEntity::getBidPrice)
                .min(Long::compareTo)
                .orElse(null);
        List<BidResponse> bids = auction.getBids().stream()
                .map(bid -> new BidResponse(
                        bid.getId(),
                        bid.getSellerId(),
                        bid.getSellerName(),
                        bid.getBidPrice(),
                        bid.getBidMessage(),
                        bid.getProductDetail()))
                .toList();
        return new AuctionResponse(auction.getId(), auction.getTitle(), auction.getDescription(), auction.getBudgetMax(), auction.getStatus(), currentLowestPrice, auction.getEndDate(), bids);
    }
}
