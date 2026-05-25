package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.reverseauction.entity.Order;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = {"product", "auction", "buyer", "seller", "bid"})
    List<Order> findByBuyer_IdOrSeller_Id(Long buyerId, Long sellerId);

    @EntityGraph(attributePaths = {"product", "auction", "buyer", "seller", "bid"})
    List<Order> findByBuyer_Id(Long buyerId);

    @EntityGraph(attributePaths = {"product", "auction", "buyer", "seller", "bid"})
    List<Order> findBySeller_Id(Long sellerId);

    @EntityGraph(attributePaths = {"product", "auction", "buyer", "seller", "bid"})
    java.util.Optional<Order> findWithDetailsById(Long id);
}
