package vn.edu.hcmuaf.reverseauction.dto.request;


public record ExternalMessageRequest(Long receiverId, String content, String type, String url, Boolean complaintChat) {

}
