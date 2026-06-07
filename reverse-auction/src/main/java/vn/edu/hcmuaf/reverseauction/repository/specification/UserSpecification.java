package vn.edu.hcmuaf.reverseauction.repository.specification;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.entity.Role;

public class UserSpecification {

    public static Specification<User> isSeller() {
        return (root, query, cb) -> cb.equal(root.get("role"), Role.ROLE_SELLER);
    }

    public static Specification<User> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isEmpty()) {
                return cb.conjunction();
            }

            String pattern = "%" + keyword.toLowerCase() + "%";

            Predicate nameLike = cb.like(cb.lower(root.get("fullName")), pattern);
            Predicate addressLike = cb.like(cb.lower(root.get("address")), pattern);

            return cb.or(nameLike, addressLike);
        };
    }
}
