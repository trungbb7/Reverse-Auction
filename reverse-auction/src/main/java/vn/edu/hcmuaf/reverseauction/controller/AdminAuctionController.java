package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.AuctionRequestResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.response.PageResponse;
import vn.edu.hcmuaf.reverseauction.service.AuctionRequestService;

@RestController
@RequestMapping("/api/admin/auctions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuctionController {

    private final AuctionRequestService auctionRequestService;

    @GetMapping
    public ResponseEntity<PageResponse<AuctionRequestResponseDTO>> getAllAuctions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(auctionRequestService.getAllAuctionRequests(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionRequestResponseDTO> getAuctionById(@PathVariable Long id) {
        return ResponseEntity.ok(auctionRequestService.findById(id));
    }
}
