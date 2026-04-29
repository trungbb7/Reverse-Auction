package vn.edu.hcmuaf.reverseauction.repository.order;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.reverseauction.entity.OrderEntity;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
}
