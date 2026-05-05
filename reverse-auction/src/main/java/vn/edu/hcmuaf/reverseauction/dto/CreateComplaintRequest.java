package vn.edu.hcmuaf.reverseauction.dto;

import java.util.List;

public record CreateComplaintRequest(Long orderId, String reason, List<String> evidenceUrls) {
}
