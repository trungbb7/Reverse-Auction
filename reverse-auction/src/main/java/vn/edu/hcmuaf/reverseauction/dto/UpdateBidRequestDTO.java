package vn.edu.hcmuaf.reverseauction.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateBidRequestDTO {
    private long bidId;
    private BigDecimal bidPrice;
    private String note;
}
