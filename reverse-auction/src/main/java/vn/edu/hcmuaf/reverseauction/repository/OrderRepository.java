package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.reverseauction.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
