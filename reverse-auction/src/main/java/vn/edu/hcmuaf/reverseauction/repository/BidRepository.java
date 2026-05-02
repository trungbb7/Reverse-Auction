package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.reverseauction.entity.Bid;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findAllByAuctionId(long auctionId);

    boolean existsByAuctionIdAndSellerId(long auctionId, long sellerId);
}
