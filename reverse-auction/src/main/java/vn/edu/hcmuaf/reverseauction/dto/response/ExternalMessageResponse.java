package vn.edu.hcmuaf.reverseauction.dto.response;

import java.time.Instant;

public record ExternalMessageResponse(
        Long msgId,
        Long conversationId,
        Long senderId,
        String senderName,
        Long receiverId,
        String receiverName,
        String content,
        String type,
        String url,
        Instant time
) {
}
