package vn.edu.hcmuaf.reverseauction.dto;

public record CreatePaymentRequest(Long orderId, Long amount, String bankCode) {
}
