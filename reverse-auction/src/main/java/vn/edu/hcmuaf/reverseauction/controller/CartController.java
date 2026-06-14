package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.request.AddToCartRequest;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.service.CartService;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody AddToCartRequest req, @AuthenticationPrincipal User user) {
        cartService.addToCart(user.getId(), req);
        return ResponseEntity.ok("Added");
    }

    @GetMapping
    public ResponseEntity<?> getCart(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartService.getCart(user.getId()));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<?> updateQty(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body
    ) {
        cartService.updateQuantity(id, body.get("quantity"));
        return ResponseEntity.ok("Updated");
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        cartService.removeItem(id);
        return ResponseEntity.ok("Deleted");
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal User user) {
        cartService.clearCart(user.getId());
        return ResponseEntity.ok("Cleared");
    }
}
