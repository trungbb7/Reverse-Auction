package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.dto.ProductRequestDTO;
import vn.edu.hcmuaf.reverseauction.dto.PageResponse;
import vn.edu.hcmuaf.reverseauction.dto.ProductResponseDTO;

import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ProductService {
    PageResponse<ProductResponseDTO> getMyProducts(Long sellerId, boolean listedForSale, Pageable pageable);

    ProductResponseDTO getMyProduct(Long id, Long sellerId);

    ProductResponseDTO getPublicProduct(Long id);

    ProductResponseDTO createProduct(ProductRequestDTO request, Long sellerId);

    ProductResponseDTO updateProduct(Long id, ProductRequestDTO request, Long sellerId);

    void deleteProduct(Long id, Long sellerId);

    PageResponse<ProductResponseDTO> getPublicProducts(Pageable pageable);
}
