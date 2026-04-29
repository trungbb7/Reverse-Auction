package vn.edu.hcmuaf.reverseauction.dto;

public record CreateMessageRequest(Long receiverId, Long auctionId, String content) {
}
