package vn.edu.hcmuaf.reverseauction.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.AuctionRequestCreateDTO;
import vn.edu.hcmuaf.reverseauction.dto.AuctionRequestResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.PageResponse;
import vn.edu.hcmuaf.reverseauction.entity.AuctionStatus;
import vn.edu.hcmuaf.reverseauction.entity.Category;
import vn.edu.hcmuaf.reverseauction.service.AuctionRequestService;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
@Slf4j
public class AuctionRequestController {

    private final AuctionRequestService auctionRequestService;

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
            @RequestParam(defaultValue = "") AuctionStatus status,
            @RequestParam(defaultValue = "") String categoryName,
            @RequestParam(defaultValue = "0") BigDecimal minBudget,
            @RequestParam(defaultValue = "0") BigDecimal maxBudget,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        log.debug("size: {}", size);
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<AuctionRequestResponseDTO> responseDTO = auctionRequestService.getFilteredAuction(keyword, categoryName, status, minBudget, maxBudget, pageable);
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
}
