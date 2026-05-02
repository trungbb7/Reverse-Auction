package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.*;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.service.BidService;

@RestController
@RequestMapping("api/bids")
@RequiredArgsConstructor
public class BidController {
    private final BidService bidService;


    @GetMapping
    @PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<GetAllBidResponseDTO> getAllBidForAuction(@RequestParam long auctionId) {
        GetAllBidResponseDTO response = bidService.getBidsForAuction(auctionId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<BidResponseDTO> getUserBidForAuction(@AuthenticationPrincipal User user, @RequestParam long auctionId) {
        long userId = user.getId();
        return ResponseEntity.ok(bidService.getUserBidByAuctionId(auctionId, userId));
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<BidResponseDTO> createBid(@AuthenticationPrincipal User user, @RequestBody CreateBidRequestDTO bid) {
        long seller_id = user.getId();
        BidResponseDTO created = bidService.create(bid, seller_id);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<BidResponseDTO> updateBid(@PathVariable long id, @RequestBody UpdateBidRequestDTO bid) {
        BidResponseDTO updated = bidService.update(id, bid);
        return ResponseEntity.ok(updated);
    }


}
