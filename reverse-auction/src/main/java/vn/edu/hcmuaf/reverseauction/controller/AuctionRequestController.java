package vn.edu.hcmuaf.reverseauction.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.*;
import vn.edu.hcmuaf.reverseauction.service.AuctionRequestService;
import vn.edu.hcmuaf.reverseauction.service.impl.AuctionService;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionRequestController {

    private final AuctionRequestService auctionRequestService;
    private final AuctionService auctionService;

    @PostMapping
    public ResponseEntity<AuctionRequestResponseDTO> createAuctionRequest(
            @Valid @RequestBody AuctionRequestCreateDTO createDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assert authentication != null;
        String email = authentication.getName();
        AuctionRequestResponseDTO responseDTO = auctionRequestService.createAuctionRequest(createDTO, email);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<PageResponse<AuctionRequestResponseDTO>> getAllAuctionRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<AuctionRequestResponseDTO> responseDTO = auctionRequestService.getAllAuctionRequests(pageable);
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionRequestResponseDTO> getAuctionById(@PathVariable long id){
        AuctionRequestResponseDTO auc = auctionRequestService.findById(id);
        return ResponseEntity.ok(auc);
    }

    @GetMapping("/my-auctions")
    public ResponseEntity<PageResponse<AuctionRequestResponseDTO>> getMyAuctionRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assert authentication != null;
        String email = authentication.getName();

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<AuctionRequestResponseDTO> responseDTO = auctionRequestService.getMyAuctionRequests(email, pageable);
        return ResponseEntity.ok(responseDTO);
    }


    @PatchMapping("/{id}/close")
    public ResponseEntity<CloseAuctionResponse> closeAuction(@PathVariable Long id, @RequestBody CloseAuctionRequest request) {
        return ResponseEntity.ok(auctionService.closeAuction(id, request));
    }
}
