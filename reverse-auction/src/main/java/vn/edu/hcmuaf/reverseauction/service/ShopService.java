package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.dto.ShopDetailResponse;

import java.util.List;

public interface ShopService {
    ShopDetailResponse getShopDetail(Long sellerId);

    List<ShopDetailResponse> getList(int limit);
}
