package vn.edu.hcmuaf.reverseauction.dto.request;

import lombok.Data;

@Data
public class GoogleLoginRequest {
    private String accessToken;
    private String role; // "ROLE_BUYER" or "ROLE_SELLER"
}
