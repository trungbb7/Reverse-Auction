package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.*;
import vn.edu.hcmuaf.reverseauction.entity.PasswordResetToken;
import vn.edu.hcmuaf.reverseauction.entity.RefreshToken;
import vn.edu.hcmuaf.reverseauction.entity.Role;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.exception.CustomException;
import vn.edu.hcmuaf.reverseauction.repository.PasswordResetTokenRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    public String register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw CustomException.builder()
                    .statusCode(HttpStatus.CONFLICT)
                    .error("Conflict")
                    .message("Email đã được sử dụng!")
                    .build();
        }
        var user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(Role.valueOf(request.getRole().toUpperCase()))
                .build();
        userRepository.save(user);
        return "Đăng ký thành công!";
    }

    public AuthenticationResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        String accessToken = jwtService.generateToken(user);
        refreshTokenService.deleteByUserId(user.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    public AuthenticationResponse refreshToken(RefreshTokenRequest request) {
        return refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String accessToken = jwtService.generateToken(user);
                    return AuthenticationResponse.builder()
                            .accessToken(accessToken)
                            .refreshToken(request.getRefreshToken())
                            .build();
                }).orElseThrow(() -> CustomException.builder()
                        .statusCode(HttpStatus.BAD_REQUEST)
                        .error("Bad request")
                        .message("Refresh token is not in database!")
                        .build());
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        // Luôn trả về thành công để tránh lộ thông tin email tồn tại hay không
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            // Xóa token cũ nếu có
            passwordResetTokenRepository.deleteByUser(user);

            // Tạo token mới hết hạn sau 15 phút
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .build();
            passwordResetTokenRepository.save(resetToken);

            // Gửi email
            emailService.sendPasswordResetEmail(user.getEmail(), token);
        });

        return "Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.";
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(request.getToken())
                .orElseThrow(() -> CustomException.builder()
                        .statusCode(HttpStatus.BAD_REQUEST)
                        .error("Bad request")
                        .message("Token không hợp lệ hoặc đã được sử dụng.")
                        .build());

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw CustomException.builder()
                    .statusCode(HttpStatus.BAD_REQUEST)
                    .error("Bad request")
                    .message("Token đã hết hạn. Vui lòng yêu cầu lại.")
                    .build();
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Xóa token sau khi dùng
        passwordResetTokenRepository.delete(resetToken);

        return "Đặt lại mật khẩu thành công!";
    }
}