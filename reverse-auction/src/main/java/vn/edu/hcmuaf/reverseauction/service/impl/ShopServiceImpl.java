package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.reverseauction.dto.RatingBreakdown;
import vn.edu.hcmuaf.reverseauction.dto.ShopDetailResponse;
import vn.edu.hcmuaf.reverseauction.dto.response.PageResponse;
import vn.edu.hcmuaf.reverseauction.entity.Order;
import vn.edu.hcmuaf.reverseauction.entity.OrderStatus;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.repository.OrderRepository;
import vn.edu.hcmuaf.reverseauction.repository.ReviewRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.repository.specification.UserSpecification;
import vn.edu.hcmuaf.reverseauction.service.ShopService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShopServiceImpl implements ShopService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

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
                .map(p -> {
                    List<Order> orders = orderRepository.findBySeller_Id(p.getId());
                    int totalOrders = orders.size();
                    double completionRate = 0.0;
                    if (totalOrders > 0) {
                        long completedOrders = orders.stream()
                                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                                .count();
                        completionRate = (double) completedOrders / totalOrders * 100.0;
                    }
                    return new ShopDetailResponse(
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
                            ),
                            totalOrders,
                            completionRate
                    );
                })
                .toList();
    }

    @Override
    public PageResponse<ShopDetailResponse> searchShops(String keyword, Pageable pageable) {
        Specification<User> spec = Specification.where(UserSpecification.isSeller())
                .and(UserSpecification.hasKeyword(keyword));

        Page<User> page = userRepository.findAll(spec, pageable);

        List<ShopDetailResponse> content = page.getContent().stream()
                .map(this::toShopDetail)
                .toList();

        return PageResponse.<ShopDetailResponse>builder()
                .content(content)
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private ShopDetailResponse toShopDetail(User seller) {
        Long sellerId = seller.getId();

        Double avgRating = reviewRepository.getAvgRatingBySellerId(sellerId);
        Long totalReviews = reviewRepository.countBySellerId(sellerId);
        RatingBreakdown breakdown = reviewRepository.getRatingBreakdown(sellerId);

        List<Order> orders = orderRepository.findBySeller_Id(sellerId);
        int totalOrders = orders.size();
        double completionRate = 0.0;
        if (totalOrders > 0) {
            long completedOrders = orders.stream()
                    .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                    .count();
            completionRate = (double) completedOrders / totalOrders * 100.0;
        }

        return new ShopDetailResponse(
                seller.getId(),
                seller.getFullName(),
                seller.getImageUrl(),
                avgRating,
                totalReviews,
                seller.getAddress(),
                breakdown,
                totalOrders,
                completionRate
        );
    }
}
