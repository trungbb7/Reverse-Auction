package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmuaf.reverseauction.dto.PageResponse;
import vn.edu.hcmuaf.reverseauction.dto.ProductResponseDTO;
import vn.edu.hcmuaf.reverseauction.service.ProductService;

@RestController
@RequestMapping("/api/public/products")
@RequiredArgsConstructor
public class PublicProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<PageResponse<ProductResponseDTO>> listPublicProducts(Pageable pageable) {
        return ResponseEntity.ok(productService.getPublicProducts(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getPublicProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getPublicProduct(id));
    }
}
