package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Controller;
import vn.edu.hcmuaf.reverseauction.dto.request.CreateBidRequestDTO;
import vn.edu.hcmuaf.reverseauction.dto.request.UpdateBidRequestDTO;
import vn.edu.hcmuaf.reverseauction.dto.response.AllBidResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.response.AuctionWSResponseDTO;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.service.BidService;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class BidWSController {

    private final BidService bidService;
    private final UserDetailsService userDetailsService;

    @MessageMapping("/place-bid/{auctionId}")
    @SendTo("/topic/auction/{auctionId}")
    public AuctionWSResponseDTO handlePlaceBid(Principal principal, @DestinationVariable String auctionId, @Payload CreateBidRequestDTO bidDTO) {
        String email = principal.getName();
        User user = (User) userDetailsService.loadUserByUsername(email);
        long sellerId = user.getId();
        bidService.create(bidDTO, sellerId);
        AllBidResponseDTO bids = bidService.getBidsForAuction(Long.parseLong(auctionId));
        return AuctionWSResponseDTO.builder().bids(bids.getBids()).build();
    }

    @MessageMapping("/update-bid/{auctionId}")
    @SendTo("/topic/auction/{auctionId}")
    public AllBidResponseDTO handleUpdateBid(Principal principal, @DestinationVariable String auctionId, @Payload UpdateBidRequestDTO bidDTO) {
        String email = principal.getName();
        User user = (User) userDetailsService.loadUserByUsername(email);
        long sellerId = user.getId();
        bidService.update(bidDTO.getBidId(), bidDTO, sellerId);
        return bidService.getBidsForAuction(Long.parseLong(auctionId));
    }
}

