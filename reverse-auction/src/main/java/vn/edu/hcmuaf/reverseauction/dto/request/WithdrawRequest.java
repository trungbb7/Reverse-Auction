package vn.edu.hcmuaf.reverseauction.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WithdrawRequest {
    private BigDecimal amount;
    private String bankName;
    private String accountNumber;
    private String accountHolder;
}
