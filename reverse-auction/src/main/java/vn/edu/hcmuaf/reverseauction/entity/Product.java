package vn.edu.hcmuaf.reverseauction.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private User seller;
    @Column
    private String imageUrl;

    @Column
    private String brand;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private Integer stock;
    @Column
    private Byte rating;
    @Column
    private BigDecimal price;

    @Column(nullable = false)
    @Builder.Default
    private Boolean listedForSale = true;


}
