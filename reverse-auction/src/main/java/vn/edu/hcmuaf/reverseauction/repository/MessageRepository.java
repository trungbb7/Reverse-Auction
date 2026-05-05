package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.reverseauction.entity.Message;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllByAuction_IdOrderByTimeAsc(Long auctionId);
}
