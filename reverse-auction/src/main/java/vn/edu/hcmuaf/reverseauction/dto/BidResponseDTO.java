package vn.edu.hcmuaf.reverseauction.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BidResponseDTO {
    private long id;
    private long auctionId;
    private long sellerId;
    private String sellerName;
    private BigDecimal bidPrice;
    private String note;
    private Boolean isWinner;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Auction info details for seller bid history
    private String auctionTitle;
    private String auctionStatus;
    private BigDecimal auctionBudget;
    private String categoryName;

    // Seller reputation statistics
    private Double sellerRating;
    private Integer sellerTotalReviews;
    private Integer sellerTotalOrders;
    private Double sellerCompletionRate;
    private String sellerKycStatus;
}
