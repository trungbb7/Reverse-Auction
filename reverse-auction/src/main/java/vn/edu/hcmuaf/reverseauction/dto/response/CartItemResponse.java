package vn.edu.hcmuaf.reverseauction.dto.response;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        Long productId,
        String productName,
        String imageUrl,
        Long shopId,
        String shopName,
        Integer quantity,
        BigDecimal price
) {}
