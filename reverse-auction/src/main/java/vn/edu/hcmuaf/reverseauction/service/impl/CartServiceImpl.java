package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import vn.edu.hcmuaf.reverseauction.dto.request.AddToCartRequest;
import vn.edu.hcmuaf.reverseauction.dto.response.CartItemResponse;
import vn.edu.hcmuaf.reverseauction.entity.CartItem;
import vn.edu.hcmuaf.reverseauction.entity.Product;
import vn.edu.hcmuaf.reverseauction.entity.ProductStatus;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.exception.ResourceNotFoundException;
import vn.edu.hcmuaf.reverseauction.repository.CartRepository;
import vn.edu.hcmuaf.reverseauction.repository.ProductRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.service.CartService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public void addToCart(Long userId, AddToCartRequest req) {

        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new ResourceNotFoundException(
                    "Sản phẩm không còn hoạt động"
            );
        }

        if (req.getQuantity() <= 0) {
            throw new ResourceNotFoundException(
                    "Số lượng không hợp lệ"
            );
        }

        CartItem item = cartRepository
                .findByUserIdAndProductId(userId, req.getProductId())
                .orElse(null);

        if (item != null) {
            item.setQuantity(item.getQuantity() + req.getQuantity());
        } else {
            item = new CartItem();
            item.setUser(buyer);
            item.setProduct(product);
            item.setQuantity(req.getQuantity());
        }

        cartRepository.save(item);
    }

    @Override
    public List<CartItemResponse> getCart(Long userId) {

        List<CartItem> items = cartRepository.findByUserId(userId);

        return items.stream().map(item -> {
            var p = item.getProduct();
            var s = p.getSeller();

            return new CartItemResponse(
                    item.getId(),
                    p.getId(),
                    p.getName(),
                    p.getImageUrl(),
                    s.getId(),
                    s.getFullName(),
                    item.getQuantity(),
                    p.getPrice()
            );
        }).toList();
    }


    public void updateQuantity(Long itemId, Integer quantity) {

        if (quantity <= 0) {
            throw new ResourceNotFoundException(
                    "INVALID_QUANTITY: Quantity must be > 0"
            );
        }

        CartItem item = cartRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "ITEM_NOT_FOUND: Item not found"
                ));

        Product product = item.getProduct();

        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new ResourceNotFoundException(
                    "Sản phẩm không còn hoạt động"
            );
        }

        if (product.getStockQuantity() != null && quantity > product.getStockQuantity()) {
            throw new ResourceNotFoundException(
                    "Số lượng không đủ"
            );
        }

        item.setQuantity(quantity);
        cartRepository.save(item);
    }

    public void removeItem(Long itemId) {
        cartRepository.deleteById(itemId);
    }

    public void clearCart(Long userId) {
        cartRepository.deleteByUserId(userId);
    }
}
