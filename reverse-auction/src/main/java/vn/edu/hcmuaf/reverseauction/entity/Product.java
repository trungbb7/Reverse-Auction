package vn.edu.hcmuaf.reverseauction.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String sku;

    @Column(length = 3000)
    private String description;

    @Column(length = 5000)
    private String specifications;

    private String brand;

    private String model;

    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(precision = 15, scale = 2)
    private BigDecimal price;

    private Integer stockQuantity;

    @Enumerated(EnumType.STRING)
    private ProductStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private User seller;

    private Long viewCount;

    private Double ratingAverage;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
