package vn.edu.hcmuaf.reverseauction.repository.specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import vn.edu.hcmuaf.reverseauction.entity.Product;
import vn.edu.hcmuaf.reverseauction.entity.ProductStatus;
import vn.edu.hcmuaf.reverseauction.entity.Category;

import java.math.BigDecimal;

public class ProductSpecification {

    public static Specification<Product> hasCategoryId(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null || categoryId == 0) {
                return cb.conjunction();
            }
            Join<Product, Category> categoryJoin = root.join("category");
            return cb.equal(categoryJoin.get("id"), categoryId);
        };
    }

    public static Specification<Product> hasCategoryName(String categoryName) {
        return (root, query, cb) -> {
            if (categoryName == null || categoryName.isEmpty()) {
                return cb.conjunction();
            }
            Join<Product, Category> categoryJoin = root.join("category");
            return cb.equal(categoryJoin.get("name"), categoryName);
        };
    }

    public static Specification<Product> hasStatus(ProductStatus status) {
        return (root, query, cb) -> {
            if (status == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<Product> inPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (minPrice == null && maxPrice == null) {
                return cb.conjunction();
            }
            if (minPrice != null && maxPrice != null) {
                return cb.between(root.get("price"), minPrice, maxPrice);
            }
            if (minPrice != null) {
                return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
            }
            return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
        };
    }

    public static Specification<Product> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isEmpty()) {
                return cb.conjunction();
            }

            String pattern = "%" + keyword.toLowerCase() + "%";

            Predicate nameLike = cb.like(cb.lower(root.get("name")), pattern);
            Predicate descriptionLike = cb.like(cb.lower(root.get("description")), pattern);
            Predicate brandLike = cb.like(cb.lower(root.get("brand")), pattern);
            Predicate modelLike = cb.like(cb.lower(root.get("model")), pattern);

            return cb.or(nameLike, descriptionLike, brandLike, modelLike);
        };
    }
}
