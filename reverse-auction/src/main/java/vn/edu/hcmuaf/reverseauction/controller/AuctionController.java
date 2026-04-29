package vn.edu.hcmuaf.reverseauction.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmuaf.reverseauction.dto.AuctionResponse;
import vn.edu.hcmuaf.reverseauction.dto.CloseAuctionRequest;
import vn.edu.hcmuaf.reverseauction.dto.CloseAuctionResponse;
import vn.edu.hcmuaf.reverseauction.service.AuctionService;

import java.util.List;

@RestController
@RequestMapping("/api/auctions")
@Tag(name = "Auction")
@RequiredArgsConstructor
public class AuctionController {
    private final AuctionService auctionService;

    @GetMapping
    public ResponseEntity<List<AuctionResponse>> listAuctions() {
        return ResponseEntity.ok(auctionService.listAuctions());
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<CloseAuctionResponse> closeAuction(@PathVariable Long id, @RequestBody CloseAuctionRequest request) {
        return ResponseEntity.ok(auctionService.closeAuction(id, request));
    }
}
