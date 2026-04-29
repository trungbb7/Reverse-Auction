package vn.edu.hcmuaf.reverseauction.repository.message;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.reverseauction.entity.MessageEntity;

import java.util.List;

public interface MessageRepository extends JpaRepository<MessageEntity, Long> {
    List<MessageEntity> findAllByAuctionIdOrderByTimeAsc(Long auctionId);
}
