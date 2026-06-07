package vn.edu.hcmuaf.reverseauction.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private String accessToken;
    private String refreshToken;

    @Builder.Default
    private boolean registered = true;
    private String email;
    private String fullName;
    private String imageUrl;
}
