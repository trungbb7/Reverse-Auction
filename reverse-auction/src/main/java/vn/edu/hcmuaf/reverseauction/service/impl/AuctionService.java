package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.AuctionResponse;
import vn.edu.hcmuaf.reverseauction.dto.BidResponse;
import vn.edu.hcmuaf.reverseauction.dto.CloseAuctionRequest;
import vn.edu.hcmuaf.reverseauction.dto.CloseAuctionResponse;
import vn.edu.hcmuaf.reverseauction.entity.AuctionRequest;
import vn.edu.hcmuaf.reverseauction.entity.AuctionStatus;
import vn.edu.hcmuaf.reverseauction.entity.Bid;
import vn.edu.hcmuaf.reverseauction.entity.Order;
import vn.edu.hcmuaf.reverseauction.repository.AuctionRepository;
import vn.edu.hcmuaf.reverseauction.repository.OrderRepository;

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
        AuctionRequest auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new IllegalArgumentException("Auction not found: " + auctionId));
        if (auction.getStatus() != AuctionStatus.OPEN) {
            throw new IllegalStateException("Auction is already closed");
        }

        Bid selectedBid = auction.getBids().stream()
                .filter(bid -> bid.getId() != null && bid.getId().equals(request.selectedBidId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Selected bid not found"));

        auction.setStatus(AuctionStatus.CLOSED);
        auctionRepository.save(auction);

        Order order = new Order();
        order.setAuction(auction);
        order.setBuyer(auction.getBuyer());
        order.setSeller(selectedBid.getSeller());
        order.setProductName(selectedBid.getProductDetail());
        order.setFinalPrice(selectedBid.getBidPrice());
        order.setStatus("CLOSED");
        order.setBuyerName(auction.getBuyer().getFullName());
        order.setSellerName(selectedBid.getSellerName());
        order.setCreatedAt(Instant.now());
        order = orderRepository.save(order);

        return new CloseAuctionResponse(order.getId(), order.getStatus(), Instant.now());
    }

    private AuctionResponse toAuctionSummary(AuctionRequest auction) {
        Long currentLowestPrice = auction.getBids().stream()
                .map(Bid::getBidPrice)
                .min(Long::compareTo)
                .orElse(null);
        List<BidResponse> bids = auction.getBids().stream()
                .map(bid -> new BidResponse(
                        bid.getId(),
                        bid.getSeller() == null ? null : bid.getSeller().getId(),
                        bid.getSellerName(),
                        bid.getBidPrice(),
                        bid.getBidMessage(),
                        bid.getProductDetail()))
                .toList();
        return new AuctionResponse(
                auction.getId(),
                auction.getTitle(),
                auction.getDescription(),
                auction.getBudgetMax(),
                auction.getStatus().name(),
                currentLowestPrice,
                auction.getEndDate(),
                bids);
    }
}
