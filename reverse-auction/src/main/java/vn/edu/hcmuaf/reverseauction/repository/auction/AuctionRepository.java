package vn.edu.hcmuaf.reverseauction.repository.auction;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.reverseauction.entity.AuctionEntity;

public interface AuctionRepository extends JpaRepository<AuctionEntity, Long> {
}
