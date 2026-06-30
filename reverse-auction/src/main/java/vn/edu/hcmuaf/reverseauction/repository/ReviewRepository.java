package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.hcmuaf.reverseauction.dto.RatingBreakdown;
import vn.edu.hcmuaf.reverseauction.entity.Review;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByOrderId(Long orderId);
    long countBySellerId(Long sellerId);
    Optional<Review> findByOrderId(Long orderId);
    List<Review> findBySellerId(Long sellerId);
    List<Review> findByProductId(Long productId);
    @Query("""
        SELECT AVG(r.rating)
        FROM Review r
        WHERE r.seller.id = :sellerId
    """)
    Double getAvgRatingBySellerId(@Param("sellerId") Long sellerId);

    @Query("""
        SELECT new vn.edu.hcmuaf.reverseauction.dto.RatingBreakdown(
            SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END),
            SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END),
            SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END),
            SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END),
            SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END)
        )
        FROM Review r
        WHERE r.seller.id = :sellerId
    """)
    RatingBreakdown getRatingBreakdown(@Param("sellerId") Long sellerId);
}
