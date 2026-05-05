package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.reverseauction.entity.AuctionRequest;

public interface AuctionRepository extends JpaRepository<AuctionRequest, Long> {
}
