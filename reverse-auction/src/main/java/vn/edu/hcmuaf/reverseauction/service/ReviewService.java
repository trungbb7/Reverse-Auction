package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.dto.request.ReviewRequest;
import vn.edu.hcmuaf.reverseauction.dto.response.ReviewContextResponse;

public interface ReviewService {
    ReviewContextResponse getContext(Long orderId, Long userId);

    void submitReview(Long userId, ReviewRequest request);
}
