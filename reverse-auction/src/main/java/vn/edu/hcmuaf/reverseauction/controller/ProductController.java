package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.ProductResponse;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    @GetMapping("/list/{id}")
    public List<ProductResponse> getShopProducts(@PathVariable Long id) {
        return productService.getProductsBySeller(id);
    }
    @GetMapping("/list")
    public List<ProductResponse> getListProducts(
            @RequestParam(defaultValue = "4") int limit
    ) {
        return productService.getListProducts(limit);
    }
}
