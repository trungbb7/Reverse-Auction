package vn.edu.hcmuaf.reverseauction.repository.specification;

import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;
import vn.edu.hcmuaf.reverseauction.entity.AuctionRequest;
import vn.edu.hcmuaf.reverseauction.entity.AuctionStatus;
import vn.edu.hcmuaf.reverseauction.entity.Category;

import java.math.BigDecimal;

public class AuctionRequestSpecification {

    public static Specification<AuctionRequest> hasCategoryName(String categoryName) {
        return (root, query, cb) -> {
        if (categoryName == null || categoryName.isEmpty()) {
            return cb.conjunction();
        }
        Join<AuctionRequest, Category> categoryJoin = root.join("category");
        return cb.equal(categoryJoin.get("name"), categoryName);
        };
    }

    public static Specification<AuctionRequest> hasStatus(AuctionStatus status){
        return (root, query, cb) -> {
            if (status == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<AuctionRequest> inBudgetRange(BigDecimal minBudget, BigDecimal maxBudget){
        return (root, query, cb) -> {
            if (maxBudget.compareTo(BigDecimal.valueOf(0)) == 0) {
                return cb.conjunction();
            }
            return cb.between(root.get("budgetMax"), minBudget, maxBudget);
        };
    }
}
