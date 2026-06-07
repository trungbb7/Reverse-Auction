package vn.edu.hcmuaf.reverseauction.dto;

import java.math.BigDecimal;
import java.util.List;

public record CreateProductRequest(
        String name,
        String description,
        String specifications,
        String brand,
        String model,
        String imageUrl,
        List<String> imageUrls,
        Long categoryId,
        BigDecimal price,
        Integer stockQuantity
) {}
