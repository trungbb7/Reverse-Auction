package vn.edu.hcmuaf.reverseauction.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmuaf.reverseauction.service.impl.AuctionService;

@RestController
@RequestMapping("/api/auctions")
@Tag(name = "Auction")
@RequiredArgsConstructor
public class AuctionController {
    private final AuctionService auctionService;


}
