package vn.edu.hcmuaf.reverseauction.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateBidRequestDTO {
    private long auctionId;
    private BigDecimal bidPrice;
    private String note;
}
