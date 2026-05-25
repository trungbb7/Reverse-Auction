package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.edu.hcmuaf.reverseauction.entity.Product;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"seller"})
    Page<Product> findBySeller_IdAndListedForSaleTrueOrderByIdDesc(Long sellerId, Pageable pageable);

    @EntityGraph(attributePaths = {"seller"})
    Page<Product> findBySeller_IdAndListedForSaleFalseOrderByIdDesc(Long sellerId, Pageable pageable);

    @EntityGraph(attributePaths = {"seller"})
    Optional<Product> findByIdAndSeller_Id(Long id, Long sellerId);

    @EntityGraph(attributePaths = {"seller"})
    Optional<Product> findByIdAndListedForSaleTrue(Long id);

    @EntityGraph(attributePaths = {"seller"})
    Page<Product> findByListedForSaleTrueOrderByIdDesc(Pageable pageable);
}
