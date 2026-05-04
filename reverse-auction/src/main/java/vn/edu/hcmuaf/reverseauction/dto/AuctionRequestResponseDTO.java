package vn.edu.hcmuaf.reverseauction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.hcmuaf.reverseauction.entity.AuctionStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuctionRequestResponseDTO {
    private Long id;
    private Long buyerId;
    private String buyerName;
    private Long categoryId;
    private String categoryName;
    private String title;
    private String description;
    private Integer quantity;
    private BigDecimal budgetMax;
    private LocalDateTime endDate;
    private AuctionStatus status;
    private LocalDateTime createdAt;
}
