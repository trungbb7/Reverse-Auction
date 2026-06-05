package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.reverseauction.entity.Bid;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {
    @EntityGraph(attributePaths = {"seller"})
    List<Bid> findAllByAuctionId(long auctionId);

    boolean existsByAuctionIdAndSellerId(long auctionId, long sellerId);

    long countBySellerId(long sellerId);
    long countBySellerIdAndIsWinner(long sellerId, boolean isWinner);
}
