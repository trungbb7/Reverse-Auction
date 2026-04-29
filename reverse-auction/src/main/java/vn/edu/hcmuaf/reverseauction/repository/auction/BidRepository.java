package vn.edu.hcmuaf.reverseauction.repository.auction;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.reverseauction.entity.BidEntity;

public interface BidRepository extends JpaRepository<BidEntity, Long> {
}
