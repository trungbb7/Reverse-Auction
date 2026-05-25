package vn.edu.hcmuaf.reverseauction.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.CreateProductRequest;
import vn.edu.hcmuaf.reverseauction.dto.ProductResponse;
import vn.edu.hcmuaf.reverseauction.dto.UpdateProductRequest;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/seller/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SELLER')")
public class SellerProductController {

    private final ProductService productService;
    @PostMapping
    public ProductResponse create(@AuthenticationPrincipal User user, @RequestBody CreateProductRequest request) {
        return productService.create(request, user.getId());
    }

    @PutMapping("/{id}")
    public ProductResponse update(
            @PathVariable Long id,
            @RequestBody UpdateProductRequest request
    ) {
        return productService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }
    @GetMapping("/{id}")
    public ProductResponse getById(@PathVariable Long id) {
        return productService.getById(id);
    }
    @GetMapping("/list")
    public List<ProductResponse> getMyProducts(@AuthenticationPrincipal User user) {
        return productService.getProductsBySeller(user.getId());
    }
}
