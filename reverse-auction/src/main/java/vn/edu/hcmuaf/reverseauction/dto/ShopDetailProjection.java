package vn.edu.hcmuaf.reverseauction.dto;

public interface ShopDetailProjection {
    Long getId();
    String getFullName();
    String getImageUrl();
    String getAddress();

    Double getAvgRating();
    Long getTotalReviews();

    Long getFive();
    Long getFour();
    Long getThree();
    Long getTwo();
    Long getOne();
}
