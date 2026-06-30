package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.dto.request.ReviewRequest;
import vn.edu.hcmuaf.reverseauction.dto.response.ReviewContextResponse;
import vn.edu.hcmuaf.reverseauction.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewContextResponse getContext(Long orderId, Long userId);

    void submitReview(Long userId, ReviewRequest request);

    List<ReviewResponse> getShopReviews(Long sellerId);
    List<ReviewResponse> getProductReviews(Long productId);
}
