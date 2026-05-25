package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.reverseauction.dto.RatingBreakdown;
import vn.edu.hcmuaf.reverseauction.dto.ShopDetailResponse;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.repository.ReviewRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.service.ShopService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShopServiceImpl implements ShopService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    @Override
    public ShopDetailResponse getShopDetail(Long sellerId) {

        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        return toShopDetail(seller);
    }

    @Override
    public List<ShopDetailResponse> getList(int limit) {
        return userRepository.findTopShops(PageRequest.of(0, limit))
                .stream()
                .map(p -> new ShopDetailResponse(
                        p.getId(),
                        p.getFullName(),
                        p.getImageUrl(),
                        p.getAvgRating(),
                        p.getTotalReviews(),
                        p.getAddress(),
                        new RatingBreakdown(
                                p.getFive(),
                                p.getFour(),
                                p.getThree(),
                                p.getTwo(),
                                p.getOne()
                        )
                ))
                .toList();
    }
    private ShopDetailResponse toShopDetail(User seller) {

        Long sellerId = seller.getId();

        Double avgRating = reviewRepository.getAvgRatingBySellerId(sellerId);
        Long totalReviews = reviewRepository.countBySellerId(sellerId);
        RatingBreakdown breakdown = reviewRepository.getRatingBreakdown(sellerId);

        return new ShopDetailResponse(
                seller.getId(),
                seller.getFullName(),
                seller.getImageUrl(),
                avgRating,
                totalReviews,
                seller.getAddress(),
                breakdown
        );
    }
}
