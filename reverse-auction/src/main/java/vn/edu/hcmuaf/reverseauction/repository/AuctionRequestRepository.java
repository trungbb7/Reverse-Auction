package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.reverseauction.entity.AuctionRequest;
import vn.edu.hcmuaf.reverseauction.entity.AuctionStatus;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.repository.specification.AuctionRequestSpecification;

import java.math.BigDecimal;

@Repository
public interface AuctionRequestRepository extends JpaRepository<AuctionRequest, Long>, JpaSpecificationExecutor<AuctionRequest> {
    Page<AuctionRequest> findByBuyer(User buyer, Pageable pageable);
}
