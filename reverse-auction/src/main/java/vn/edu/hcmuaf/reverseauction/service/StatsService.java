package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.dto.AdminStatsResponse;
import vn.edu.hcmuaf.reverseauction.dto.SellerStatsResponse;

public interface StatsService {
    AdminStatsResponse getAdminStats();
    SellerStatsResponse getSellerStats(Long sellerId);
}
