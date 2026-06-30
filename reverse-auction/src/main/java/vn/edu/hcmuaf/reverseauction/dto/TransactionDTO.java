package vn.edu.hcmuaf.reverseauction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.hcmuaf.reverseauction.entity.TransactionStatus;
import vn.edu.hcmuaf.reverseauction.entity.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TransactionDTO {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private BigDecimal amount;
    private TransactionType type;
    private TransactionStatus status;
    private String code;
    private String description;
    private LocalDateTime createdAt;
    private String bankName;
    private String accountNumber;
    private String accountHolder;
}
