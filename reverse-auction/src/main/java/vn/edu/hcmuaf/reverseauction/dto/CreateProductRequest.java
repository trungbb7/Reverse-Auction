package vn.edu.hcmuaf.reverseauction.dto;

import java.math.BigDecimal;

public record CreateProductRequest(
        String name,
        String description,
        String specifications,
        String brand,
        String model,
        String imageUrl,
        Long categoryId,
        BigDecimal price,
        Integer stockQuantity
) {}
