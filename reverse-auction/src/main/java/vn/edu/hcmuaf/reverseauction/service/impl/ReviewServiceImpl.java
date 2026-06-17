package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.SellerRatingDTO;
import vn.edu.hcmuaf.reverseauction.dto.request.ReviewRequest;
import vn.edu.hcmuaf.reverseauction.dto.response.ReviewContextResponse;
import vn.edu.hcmuaf.reverseauction.dto.response.ReviewResponse;
import vn.edu.hcmuaf.reverseauction.entity.Order;
import vn.edu.hcmuaf.reverseauction.entity.OrderStatus;
import vn.edu.hcmuaf.reverseauction.entity.Review;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.repository.OrderRepository;
import vn.edu.hcmuaf.reverseauction.repository.ReviewRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.service.ReviewService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    @Override
    public ReviewContextResponse getContext(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow();

        if (!order.getBuyer().getId().equals(userId)) {
            throw new RuntimeException("Not your order");
        }

        User seller = order.getSeller();

        ReviewContextResponse res = new ReviewContextResponse();
        res.setOrderId(order.getId());
        res.setProductName(order.getProduct().getName());
        res.setProductImage(order.getProduct().getImageUrl());

        SellerRatingDTO sellerDTO = new SellerRatingDTO();
        sellerDTO.setId(seller.getId());
        sellerDTO.setName(seller.getFullName());
        sellerDTO.setRating(seller.getRating());
        sellerDTO.setTotalReviews(seller.getTotalReviews());

        res.setSeller(sellerDTO);

        res.setAlreadyReviewed(
                reviewRepository.existsByOrderId(orderId)
        );

        res.setCanReview(
                order.getStatus() == OrderStatus.DELIVERED ||
                        order.getStatus() == OrderStatus.COMPLETED
        );

        return res;
    }

    @Override
    @Transactional
    public void submitReview(Long userId, ReviewRequest request) {

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getBuyer().getId().equals(userId)) {
            throw new RuntimeException("Invalid order");
        }

        if (reviewRepository.existsByOrderId(request.getOrderId())) {
            throw new RuntimeException("Already reviewed");
        }

        Review review = new Review();
        review.setOrder(order);
        review.setBuyer(order.getBuyer());
        review.setSeller(order.getSeller());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setCreatedAt(LocalDateTime.now());

        reviewRepository.save(review);

        updateSellerRating(order.getSeller(), request.getRating());
    }

    @Override
    public List<ReviewResponse> getShopReviews(Long sellerId) {
        List<Review> reviews = reviewRepository.findBySellerId(sellerId);

        return reviews.stream()
                .map(this::toResponse)
                .toList();
    }
    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId().toString(),
                review.getBuyer().getFullName(),
                review.getComment(),
                review.getRating(),
                review.getCreatedAt()
        );
    }

    private void updateSellerRating(User seller, int newRating) {

        int oldTotal = seller.getTotalReviews();
        double oldRating = seller.getRating();

        double newAvg =
                (oldRating * oldTotal + newRating) / (oldTotal + 1);

        seller.setRating(newAvg);
        seller.setTotalReviews(oldTotal + 1);

        userRepository.save(seller);
    }
}
