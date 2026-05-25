package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.request.ReviewRequest;
import vn.edu.hcmuaf.reverseauction.dto.response.ReviewContextResponse;
import vn.edu.hcmuaf.reverseauction.dto.response.ReviewResponse;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.service.ReviewService;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/order/{orderId}")
    public ReviewContextResponse getContext(
            @PathVariable Long orderId,
            @AuthenticationPrincipal User user
    ) {
        return reviewService.getContext(orderId, user.getId());
    }

    @PostMapping
    public void submit(
            @RequestBody ReviewRequest req,
            @AuthenticationPrincipal User user
    ) {
        reviewService.submitReview(user.getId(), req);
    }
    @GetMapping("/shop/{sellerId}")
    public List<ReviewResponse> getShopReviews(@PathVariable Long sellerId) {
        return reviewService.getShopReviews(sellerId);
    }
}