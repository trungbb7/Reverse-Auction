package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.reverseauction.entity.AuctionRequest;
import vn.edu.hcmuaf.reverseauction.entity.User;

@Repository
public interface AuctionRequestRepository extends JpaRepository<AuctionRequest, Long> {
    Page<AuctionRequest> findByBuyer(User buyer, Pageable pageable);
}
