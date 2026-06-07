package vn.edu.hcmuaf.reverseauction.dto;

public record ShopDetailResponse(
        Long id,
        String name,
        String avatar,
        Double rating,
        Long totalReviews,
        String location,
        RatingBreakdown ratingBreakdown,
        Integer totalOrders,
        Double completionRate
) {}
