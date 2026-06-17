package vn.edu.hcmuaf.reverseauction.service;

import org.springframework.data.domain.Pageable;
import vn.edu.hcmuaf.reverseauction.dto.CreateProductRequest;
import vn.edu.hcmuaf.reverseauction.dto.ProductResponse;
import vn.edu.hcmuaf.reverseauction.dto.UpdateProductRequest;
import vn.edu.hcmuaf.reverseauction.dto.response.PageResponse;

import java.math.BigDecimal;
import java.util.List;

public interface ProductService {
    ProductResponse create(CreateProductRequest request, Long id);

    ProductResponse update(Long id, UpdateProductRequest request);

    void delete(Long id);

    ProductResponse getById(Long id);
    List<ProductResponse> getProductsBySeller(Long sellerId);
    List<ProductResponse> getListProducts(int limit);
    PageResponse<ProductResponse> getFilteredProducts(
            String keyword,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable
    );
}
