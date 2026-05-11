package vn.edu.hcmuaf.reverseauction.dto;

import lombok.Data;

@Data
public class SellerRatingDTO {
    private Long id;
    private String name;
    private Double rating;
    private String imageUrl;
    private Integer totalReviews;
}
