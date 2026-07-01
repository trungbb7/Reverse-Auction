package vn.edu.hcmuaf.reverseauction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProductResponse(

        Long id,
        String name,
        String description,
        String specifications,

        String brand,
        String model,
        String imageUrl,
        List<String> imageUrls,

        BigDecimal price,
        BigDecimal originalPrice,
        Integer stockQuantity,

        String status,

        Long categoryId,
        String categoryName,
        Double rating,

        Long sellerId,
        String sellerName,

        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}

