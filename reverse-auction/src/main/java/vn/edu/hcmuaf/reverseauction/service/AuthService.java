package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.dto.*;

public interface AuthService {
    String register(RegisterRequest request);
    AuthenticationResponse login(LoginRequest request);
    AuthenticationResponse refreshToken(RefreshTokenRequest request);
    String forgotPassword(ForgotPasswordRequest request);
    String resetPassword(ResetPasswordRequest request);
}

