package vn.edu.hcmuaf.reverseauction.dto.ai;

import java.util.List;

public record AiChatRequest(
        String message,
        List<AiChatTurn> history
) {
}
