package vn.edu.hcmuaf.reverseauction.service;

import org.springframework.data.domain.Pageable;
import vn.edu.hcmuaf.reverseauction.dto.ShopDetailResponse;
import vn.edu.hcmuaf.reverseauction.dto.response.PageResponse;

import java.util.List;

public interface ShopService {
    ShopDetailResponse getShopDetail(Long sellerId);

    List<ShopDetailResponse> getList(int limit);

    PageResponse<ShopDetailResponse> searchShops(String keyword, Pageable pageable);
}
