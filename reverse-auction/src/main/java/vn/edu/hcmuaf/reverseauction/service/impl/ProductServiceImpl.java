package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.reverseauction.dto.CreateProductRequest;
import vn.edu.hcmuaf.reverseauction.dto.ProductResponse;
import vn.edu.hcmuaf.reverseauction.dto.UpdateProductRequest;
import vn.edu.hcmuaf.reverseauction.entity.Category;
import vn.edu.hcmuaf.reverseauction.entity.Product;
import vn.edu.hcmuaf.reverseauction.entity.ProductStatus;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.repository.CategoryRepository;
import vn.edu.hcmuaf.reverseauction.repository.ProductRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.service.ProductService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Override
    public ProductResponse create(CreateProductRequest request, Long id) {
        Product p = new Product();

        mapCreate(request, p);
        User seller = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        p.setSeller(seller);
        p.setStatus(ProductStatus.ACTIVE);
        p.setCreatedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());

        Product saved = productRepository.save(p);

        return toResponse(saved);
    }

    @Override
    public ProductResponse update(Long id, UpdateProductRequest request) {

        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        mapUpdate(request, p);

        p.setUpdatedAt(LocalDateTime.now());

        Product saved = productRepository.save(p);

        return toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    @Override
    public ProductResponse getById(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return toResponse(p);
    }

    @Override
    public List<ProductResponse> getProductsBySeller(Long sellerId) {
        List<Product> products = productRepository.findBySellerId(sellerId);
        return products.stream()
                .map(this::toResponse)
                .toList();
    }
    private void mapCreate(CreateProductRequest r, Product p) {
        p.setName(r.name());
        p.setDescription(r.description());
        p.setSpecifications(r.specifications());
        p.setBrand(r.brand());
        p.setModel(r.model());
        p.setImageUrl(r.imageUrl());
        p.setPrice(r.price());
        p.setStockQuantity(r.stockQuantity());

        Category c = categoryRepository.findById(r.categoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        p.setCategory(c);
    }
    private void mapUpdate(UpdateProductRequest r, Product p) {

        if (r.name() != null) p.setName(r.name());
        if (r.description() != null) p.setDescription(r.description());
        if (r.specifications() != null) p.setSpecifications(r.specifications());
        if (r.brand() != null) p.setBrand(r.brand());
        if (r.model() != null) p.setModel(r.model());
        if (r.imageUrl() != null) p.setImageUrl(r.imageUrl());

        if (r.price() != null) p.setPrice(r.price());
        if (r.stockQuantity() != null) p.setStockQuantity(r.stockQuantity());

        if (r.categoryId() != null) {
            Category c = categoryRepository.findById(r.categoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            p.setCategory(c);
        }
    }
    private ProductResponse toResponse(Product p) {

        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getSpecifications(),
                p.getBrand(),
                p.getModel(),
                p.getImageUrl(),
                p.getPrice(),
                p.getStockQuantity(),
                p.getStatus().name(),
                p.getCategory().getId(),
                p.getCategory().getName(),
                p.getSeller().getId(),
                p.getSeller().getFullName(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
