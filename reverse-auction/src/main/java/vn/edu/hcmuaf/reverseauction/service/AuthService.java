package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.dto.request.*;
import vn.edu.hcmuaf.reverseauction.dto.response.AuthenticationResponse;

public interface AuthService {
    String register(RegisterRequest request);
    AuthenticationResponse login(LoginRequest request);
    AuthenticationResponse refreshToken(RefreshTokenRequest request);
    String forgotPassword(ForgotPasswordRequest request);
    String resetPassword(ResetPasswordRequest request);
    AuthenticationResponse googleLogin(GoogleLoginRequest request);
    String verifyEmail(String token);
}

