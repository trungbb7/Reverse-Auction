package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.dto.request.AddToCartRequest;
import vn.edu.hcmuaf.reverseauction.dto.response.CartItemResponse;
import vn.edu.hcmuaf.reverseauction.entity.CartItem;

import java.util.List;

public interface CartService {
    void addToCart(Long userId, AddToCartRequest req);
    List<CartItemResponse> getCart(Long userId);
    void updateQuantity(Long itemId, Integer quantity);
    void removeItem(Long itemId);
    void clearCart(Long userId);
}
