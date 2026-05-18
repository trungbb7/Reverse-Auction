package vn.edu.hcmuaf.reverseauction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(

        Long id,
        String name,
        String description,
        String specifications,

        String brand,
        String model,
        String imageUrl,

        BigDecimal price,
        Integer stockQuantity,

        String status,

        Long categoryId,
        String categoryName,

        Long sellerId,
        String sellerName,

        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}

