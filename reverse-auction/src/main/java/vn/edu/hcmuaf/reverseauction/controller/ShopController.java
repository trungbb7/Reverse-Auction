package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.ProductResponse;
import vn.edu.hcmuaf.reverseauction.dto.ShopDetailResponse;
import vn.edu.hcmuaf.reverseauction.service.ProductService;
import vn.edu.hcmuaf.reverseauction.service.ShopService;

import java.util.List;

@RestController
@RequestMapping("/api/shop")
@RequiredArgsConstructor
public class ShopController {
    private final ShopService shopService;
    private final ProductService productService;
    @GetMapping("/detail/{sellerId}")
    public ShopDetailResponse getShop(@PathVariable Long sellerId) {
        System.out.println("CONTROLLER HIT sellerId = " + sellerId);
        return shopService.getShopDetail(sellerId);
    }

    @GetMapping("/{sellerId}/products")
    public List<ProductResponse> getProducts(@PathVariable Long sellerId) {
        return productService.getProductsBySeller(sellerId);
    }

    @GetMapping("/list")
    public List<ShopDetailResponse> getAllShops(
            @RequestParam(defaultValue = "4") int limit
    ) {
        return shopService.getList(limit);
    }
}
