package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.reverseauction.entity.AuctionImage;

public interface AuctionImageRepository extends JpaRepository<AuctionImage, Long> {
}
