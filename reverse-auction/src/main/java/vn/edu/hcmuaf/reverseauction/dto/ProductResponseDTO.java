package vn.edu.hcmuaf.reverseauction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDTO {
    private Long id;
    private String name;
    private String imageUrl;
    private String brand;
    private String description;
    private Integer stock;
    private Byte rating;
    private BigDecimal price;
    private Boolean listedForSale;
    private Long sellerId;
    private String sellerName;
}
