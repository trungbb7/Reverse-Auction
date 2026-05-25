package vn.edu.hcmuaf.reverseauction.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.ProductRequestDTO;
import vn.edu.hcmuaf.reverseauction.dto.PageResponse;
import vn.edu.hcmuaf.reverseauction.dto.ProductResponseDTO;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/seller/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
public class SellerProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<PageResponse<ProductResponseDTO>> getMyProducts(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "true") boolean listedForSale,
            Pageable pageable
    ) {
        return ResponseEntity.ok(productService.getMyProducts(user.getId(), listedForSale, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getMyProduct(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(productService.getMyProduct(id, user.getId()));
    }

    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ProductRequestDTO request
    ) {
        ProductResponseDTO created = productService.createProduct(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO request
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, request, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@AuthenticationPrincipal User user, @PathVariable Long id) {
        productService.deleteProduct(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
