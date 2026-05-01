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
    private boolean isWinner;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
