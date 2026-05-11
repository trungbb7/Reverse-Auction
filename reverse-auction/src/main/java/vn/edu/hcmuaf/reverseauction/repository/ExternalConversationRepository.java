package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.reverseauction.entity.ExternalConversation;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExternalConversationRepository extends JpaRepository<ExternalConversation, Long> {
    Optional<ExternalConversation> findByParticipantsHash(String participantsHash);

    List<ExternalConversation> findAllByUser1_IdOrUser2_IdOrderByUpdatedDateDesc(Long user1Id, Long user2Id);

    @Query("select coalesce(max(c.id), 0) from ExternalConversation c")
    Long findMaxId();
}
