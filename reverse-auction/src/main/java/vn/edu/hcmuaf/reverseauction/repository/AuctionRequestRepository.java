package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.reverseauction.entity.AuctionRequest;
import vn.edu.hcmuaf.reverseauction.entity.AuctionStatus;
import vn.edu.hcmuaf.reverseauction.entity.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionRequestRepository
        extends JpaRepository<AuctionRequest, Long>, JpaSpecificationExecutor<AuctionRequest> {

    @EntityGraph(attributePaths = { "buyer", "bids", "category", "auctionImages" })
    Page<AuctionRequest> findByBuyer(User buyer, Pageable pageable);

    Optional<AuctionRequest> findByTitle(String title);

    List<AuctionRequest> findByStatusAndEndDateBefore(AuctionStatus status, LocalDateTime dateTime);

    @EntityGraph(attributePaths = { "buyer", "bids", "category", "auctionImages" })
    Page<AuctionRequest> findAll(Specification<AuctionRequest> spec, Pageable pageable);

    @EntityGraph(attributePaths = { "buyer", "bids", "category", "auctionImages" })
    Optional<AuctionRequest> findById(Long id);
}
