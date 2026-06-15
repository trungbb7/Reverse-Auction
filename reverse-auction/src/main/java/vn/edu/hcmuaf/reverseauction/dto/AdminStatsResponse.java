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
public class AdminStatsResponse {
    private long totalUsers;
    private long totalOrders;
    private long totalAuctions;
    private BigDecimal totalRevenue;
    private Map<String, BigDecimal> revenueByDay;
    private Map<String, BigDecimal> revenueByMonth;
    private Map<String, BigDecimal> revenueByYear;
    private Map<String, BigDecimal> revenueByCategory;
    private Map<String, Long> ordersByStatus;
}
