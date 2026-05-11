package vn.edu.hcmuaf.reverseauction.dto.response;

import java.time.Instant;

public record ExternalConversationResponse(
        Long conversationId,
        Long participantId,
        String participantName,
        String participantEmail,
        String participantRole,
        String lastMessage,
        Instant lastMessageAt,
        Instant createdDate,
        Instant updatedDate
) {
}
