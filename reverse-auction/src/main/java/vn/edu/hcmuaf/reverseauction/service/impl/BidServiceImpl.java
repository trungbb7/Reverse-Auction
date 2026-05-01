package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.reverseauction.dto.*;
import vn.edu.hcmuaf.reverseauction.entity.AuctionRequest;
import vn.edu.hcmuaf.reverseauction.entity.Bid;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.exception.CustomException;
import vn.edu.hcmuaf.reverseauction.mapper.BidMapper;
import vn.edu.hcmuaf.reverseauction.repository.AuctionRequestRepository;
import vn.edu.hcmuaf.reverseauction.repository.BidRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.service.BidService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BidServiceImpl implements BidService {
    private final BidRepository bidRepository;
    private final AuctionRequestRepository auctionRequestRepository;
    private final UserRepository userRepository;
    private final BidMapper bidMapper;

    @Override
    public BidResponseDTO update(long id, UpdateBidRequestDTO bid) {
        Bid existing = bidRepository.findById(id).
                orElseThrow(() -> CustomException
                .builder()
                .message("Không tìm thấy bid id")
                .statusCode(HttpStatus.NOT_FOUND)
                .error("Not found")
                .build());
        existing.setBidPrice(bid.getBidPrice());
        Bid saved = bidRepository.save(existing);
        return bidMapper.toDTO(saved);
    }

    @Override
    public GetAllBidResponseDTO getBidsForAuction(long auctionId) {
        List<Bid> bids = bidRepository.findAllByAuctionId(auctionId);
        List<BidResponseDTO> bidsDTO = bids.stream().map(bidMapper::toDTO).toList();
        return new GetAllBidResponseDTO(bidsDTO);
    }

    @Override
    public BidResponseDTO getUserBidByAuctionId(long auctionId, long userId) {
        AuctionRequest auc = auctionRequestRepository.findById(auctionId)
                .orElseThrow(() -> CustomException.builder()
                        .error("Not found")
                        .message("Không tim thấy phiên đấu giá!")
                        .statusCode(HttpStatus.NOT_FOUND)
                        .build());

        Bid uBid = auc.getBids().stream().filter((bid) -> bid.getSeller().getId() == userId).findFirst()
                .orElseThrow(() -> CustomException.builder()
                        .error("Not found")
                        .message("Không tim thấy phiên người bán!")
                        .statusCode(HttpStatus.NOT_FOUND)
                        .build());
        return bidMapper.toDTO(uBid);
    }

    @Override
    public BidResponseDTO create(CreateBidRequestDTO requestDTO, long sellerId) {
        AuctionRequest auc = auctionRequestRepository.findById(requestDTO.getAuctionId())
                .orElseThrow(() -> CustomException.builder()
                        .statusCode(HttpStatus.NOT_FOUND)
                        .error("Not found")
                        .message("Không tìm thấy phiên đấu giá")
                        .build());
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> CustomException.builder()
                        .statusCode(HttpStatus.NOT_FOUND)
                        .error("Not found")
                        .message("Không tìm thấy người bán")
                        .build());

        Bid bid = Bid.builder()
                .auction(auc)
                .seller(seller)
                .bidPrice(requestDTO.getBidPrice())
                .note(requestDTO.getNote())
                .build();
        Bid saved = bidRepository.save(bid);
        return bidMapper.toDTO(saved);
    }
}
