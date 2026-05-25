package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.PageResponse;
import vn.edu.hcmuaf.reverseauction.dto.ProductRequestDTO;
import vn.edu.hcmuaf.reverseauction.dto.ProductResponseDTO;
import vn.edu.hcmuaf.reverseauction.entity.Product;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.exception.CustomException;
import vn.edu.hcmuaf.reverseauction.repository.ProductRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.service.ProductService;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponseDTO> getMyProducts(Long sellerId, boolean listedForSale, Pageable pageable) {
        Page<Product> page = listedForSale
                ? productRepository.findBySeller_IdAndListedForSaleTrueOrderByIdDesc(sellerId, pageable)
                : productRepository.findBySeller_IdAndListedForSaleFalseOrderByIdDesc(sellerId, pageable);
        return toPageResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDTO getMyProduct(Long id, Long sellerId) {
        Product product = productRepository.findByIdAndSeller_Id(id, sellerId)
                .orElseThrow(() -> CustomException.builder()
                        .statusCode(HttpStatus.NOT_FOUND)
                        .error("Not found")
                        .message("Không tìm thấy sản phẩm")
                        .build());
        return toDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDTO getPublicProduct(Long id) {
        Product product = productRepository.findByIdAndListedForSaleTrue(id)
                .orElseThrow(() -> CustomException.builder()
                        .statusCode(HttpStatus.NOT_FOUND)
                        .error("Not found")
                        .message("Không tìm thấy sản phẩm")
                        .build());
        return toDTO(product);
    }

    @Override
    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO request, Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> CustomException.builder()
                        .statusCode(HttpStatus.NOT_FOUND)
                        .error("Not found")
                        .message("Không tìm thấy người bán")
                        .build());

        Product product = Product.builder()
                .name(request.getName().trim())
                .imageUrl(normalizeString(request.getImageUrl()))
                .brand(normalizeString(request.getBrand()))
                .description(normalizeString(request.getDescription()))
                .stock(request.getStock())
                .rating(Byte.valueOf((byte) 0))
                .price(request.getPrice())
                .listedForSale(true)
                .seller(seller)
                .build();

        return toDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO request, Long sellerId) {
        Product product = productRepository.findByIdAndSeller_Id(id, sellerId)
                .orElseThrow(() -> CustomException.builder()
                        .statusCode(HttpStatus.NOT_FOUND)
                        .error("Not found")
                        .message("Không tìm thấy sản phẩm")
                        .build());

        product.setName(request.getName().trim());
        product.setImageUrl(normalizeString(request.getImageUrl()));
        product.setBrand(normalizeString(request.getBrand()));
        product.setDescription(normalizeString(request.getDescription()));
        product.setStock(request.getStock());
        product.setRating(Byte.valueOf((byte) 0));
        product.setListedForSale(true);
        product.setPrice(request.getPrice());

        return toDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long id, Long sellerId) {
        Product product = productRepository.findByIdAndSeller_Id(id, sellerId)
                .orElseThrow(() -> CustomException.builder()
                        .statusCode(HttpStatus.NOT_FOUND)
                        .error("Not found")
                        .message("Không tìm thấy sản phẩm")
                        .build());

        productRepository.delete(product);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponseDTO> getPublicProducts(Pageable pageable) {
        Page<Product> page = productRepository.findByListedForSaleTrueOrderByIdDesc(pageable);
        return toPageResponse(page);
    }

    private ProductResponseDTO toDTO(Product product) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .imageUrl(product.getImageUrl())
                .brand(product.getBrand())
                .description(product.getDescription())
                .stock(product.getStock())
                .rating(product.getRating())
                .price(product.getPrice())
                .listedForSale(product.getListedForSale())
                .sellerId(product.getSeller() == null ? null : product.getSeller().getId())
                .sellerName(product.getSeller() == null ? null : product.getSeller().getFullName())
                .build();
    }

    private PageResponse<ProductResponseDTO> toPageResponse(Page<Product> page) {
        return PageResponse.<ProductResponseDTO>builder()
                .content(page.getContent().stream().map(this::toDTO).toList())
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private String normalizeString(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
