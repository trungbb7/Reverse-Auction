package vn.edu.hcmuaf.reverseauction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SellerStatsResponse {
    private long totalBids;
    private long totalWonBids;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private Map<String, BigDecimal> revenueByMonth;
    private Map<String, Long> ordersByStatus;
}
