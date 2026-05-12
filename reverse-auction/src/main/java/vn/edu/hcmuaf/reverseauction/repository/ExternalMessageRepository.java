package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.reverseauction.entity.ExternalMessage;

import java.util.List;

@Repository
public interface ExternalMessageRepository extends JpaRepository<ExternalMessage,Long> {
    List<ExternalMessage> findAllByConversation_IdOrderByCreatedDateAsc(Long conversationId);

    ExternalMessage findTopByConversation_IdOrderByCreatedDateDesc(Long conversationId);
}
