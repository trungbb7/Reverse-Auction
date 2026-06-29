package vn.edu.hcmuaf.reverseauction.dto.ai;

import java.util.List;

public record AiChatResponse(
        String message,
        List<AiAction> suggestedActions,
        String provider
) {
}
