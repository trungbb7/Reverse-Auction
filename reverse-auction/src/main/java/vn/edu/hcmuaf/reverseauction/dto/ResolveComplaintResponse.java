package vn.edu.hcmuaf.reverseauction.dto;

import java.time.Instant;

public record ResolveComplaintResponse(
        Long complaintId,
        String resolution,
        String finalAction,
        Instant resolvedAt
) {
}
