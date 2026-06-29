package vn.edu.hcmuaf.reverseauction.dto.ai;

import java.util.Map;

public record AiAction(
        String type,
        String label,
        Map<String, Object> payload
) {
}
