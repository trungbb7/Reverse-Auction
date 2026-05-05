package vn.edu.hcmuaf.reverseauction.dto.response;

import java.time.Instant;

public record ExternalMessageResponse(Long msgId, Long receiverId, String content, Instant time) {
}
