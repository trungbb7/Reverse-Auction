package vn.edu.hcmuaf.reverseauction.dto;

import java.time.LocalDateTime;

public record ShopDetailResponse(
        Long id,
        String name,
        String avatar,
        Double rating,
        Long totalReviews,
        String location,
        RatingBreakdown ratingBreakdown
) {}
