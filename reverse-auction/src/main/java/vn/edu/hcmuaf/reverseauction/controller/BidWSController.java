package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Controller;
import vn.edu.hcmuaf.reverseauction.dto.AllBidResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.BidResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.CreateBidRequestDTO;
import vn.edu.hcmuaf.reverseauction.dto.UpdateBidRequestDTO;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.service.BidService;
import vn.edu.hcmuaf.reverseauction.service.UserService;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class BidWSController {

    private final BidService bidService;
    private final UserDetailsService userDetailsService;

    @MessageMapping("/place-bid/{auctionId}")
    @SendTo("/topic/auction/{auctionId}")
    public AllBidResponseDTO handlePlaceBid(Principal principal, @DestinationVariable String auctionId, @Payload CreateBidRequestDTO bidDTO) {
        String email = principal.getName();
        User user = (User) userDetailsService.loadUserByUsername(email);
        long sellerId = user.getId();
        bidService.create(bidDTO, sellerId);
        return bidService.getBidsForAuction(Long.parseLong(auctionId));
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

