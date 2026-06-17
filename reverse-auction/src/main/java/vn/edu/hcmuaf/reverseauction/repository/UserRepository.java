package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import vn.edu.hcmuaf.reverseauction.dto.ShopDetailProjection;
import vn.edu.hcmuaf.reverseauction.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmail(String email);

    @Query("""
        SELECT 
            u.id AS id,
            u.fullName AS fullName,
            u.imageUrl AS imageUrl,
            u.address AS address,

            COALESCE(AVG(r.rating), 0.0) AS avgRating,
            COUNT(r.id) AS totalReviews,

            COALESCE(SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END), 0) AS five,
            COALESCE(SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END), 0) AS four,
            COALESCE(SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END), 0) AS three,
            COALESCE(SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END), 0) AS two,
            COALESCE(SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END), 0) AS one
        FROM User u
        LEFT JOIN Review r ON r.seller.id = u.id
        WHERE u.role = 'ROLE_SELLER'
        GROUP BY u.id, u.fullName, u.imageUrl, u.address
""")
    List<ShopDetailProjection> findTopShops(Pageable pageable);
}