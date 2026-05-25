package vn.edu.hcmuaf.reverseauction.dto.request;


public record ExternalMessageRequest (
        Long conversationId,
        Long receiverId,
        String content
) {

}
