package vn.edu.hcmuaf.reverseauction.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {

    private Long id;
    private String code;
    private String type;

    private Long productId;
    private String productName;
    private String imageUrl;
    private String brand;

    private Long buyerId;
    private String buyerName;

    private Long sellerId;
    private String sellerName;

    private BigDecimal finalPrice;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;

    private String status;
    private boolean alreadyReviewed;

    private Long auctionId;
    private Long bidId;

    private String shippingAddress;
    private String buyerPhone;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}