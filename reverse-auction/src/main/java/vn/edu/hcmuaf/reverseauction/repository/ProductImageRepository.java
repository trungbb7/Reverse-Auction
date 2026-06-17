package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.reverseauction.entity.ProductImage;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
}
