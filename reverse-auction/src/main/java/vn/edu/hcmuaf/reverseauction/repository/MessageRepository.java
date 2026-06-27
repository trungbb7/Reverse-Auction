package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.hcmuaf.reverseauction.entity.Message;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllByAuction_IdOrderByTimeAsc(Long auctionId);

    @Query("SELECT m FROM Message m WHERE m.auction.id = :auctionId AND " +
           "((m.sender.id = :user1Id AND m.receiver.id = :user2Id) OR " +
           "(m.sender.id = :user2Id AND m.receiver.id = :user1Id)) " +
           "ORDER BY m.time ASC")
    List<Message> findConversation(@Param("auctionId") Long auctionId, @Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
}
