package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.request.*;
import vn.edu.hcmuaf.reverseauction.dto.response.AuthenticationResponse;
import vn.edu.hcmuaf.reverseauction.entity.PasswordResetToken;
import vn.edu.hcmuaf.reverseauction.entity.RefreshToken;
import vn.edu.hcmuaf.reverseauction.entity.Role;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.exception.CustomException;
import vn.edu.hcmuaf.reverseauction.repository.PasswordResetTokenRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.service.AuthService;

import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtServiceImpl jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenServiceImpl refreshTokenService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailServiceImpl emailService;

    @Override
    public String register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw CustomException.builder()
                    .status(HttpStatus.CONFLICT)
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

    @Override
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

    @Override
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
                        .status(HttpStatus.BAD_REQUEST)
                        .error("Bad request")
                        .message("Refresh token is not in database!")
                        .build());
    }

    @Override
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUser(user);

            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .build();
            passwordResetTokenRepository.save(resetToken);

            emailService.sendPasswordResetEmail(user.getEmail(), token);
        });

        return "Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.";
    }

    @Override
    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByToken(request.getToken())
                .orElseThrow(() -> CustomException.builder()
                        .status(HttpStatus.BAD_REQUEST)
                        .error("Bad request")
                        .message("Token không hợp lệ hoặc đã được sử dụng.")
                        .build());

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
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

    @Override
    public AuthenticationResponse googleLogin(GoogleLoginRequest request) {
        String googleUserinfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
        RestTemplate restTemplate = new RestTemplate();

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(request.getAccessToken());
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            var response = restTemplate.exchange(
                    googleUserinfoUrl,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> body = (Map<String, Object>) response.getBody();
            if (body == null || !response.getStatusCode().is2xxSuccessful()) {
                throw CustomException.builder()
                        .status(HttpStatus.BAD_REQUEST)
                        .error("Bad Request")
                        .message("Token Google không hợp lệ hoặc đã hết hạn!")
                        .build();
            }

            String email = (String) body.get("email");
            String name = (String) body.get("name");
            String picture = (String) body.get("picture");

            if (email == null) {
                throw CustomException.builder()
                        .status(HttpStatus.BAD_REQUEST)
                        .error("Bad Request")
                        .message("Không thể truy xuất email từ Google token!")
                        .build();
            }

            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                // Nếu chưa có tài khoản và chưa chọn vai trò
                if (request.getRole() == null || request.getRole().trim().isEmpty()) {
                    return AuthenticationResponse.builder()
                            .registered(false)
                            .email(email)
                            .fullName(name != null ? name : email.split("@")[0])
                            .imageUrl(picture)
                            .build();
                } else {
                    // Tạo tài khoản mới với vai trò đã chọn
                    Role userRole;
                    try {
                        userRole = Role.valueOf(request.getRole().toUpperCase());
                    } catch (IllegalArgumentException e) {
                        throw CustomException.builder()
                                .status(HttpStatus.BAD_REQUEST)
                                .error("Bad Request")
                                .message("Vai trò lựa chọn không hợp lệ!")
                                .build();
                    }

                    User newUser = User.builder()
                            .email(email)
                            .fullName(name != null ? name : email.split("@")[0])
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .imageUrl(picture)
                            .role(userRole)
                            .enabled(true)
                            .build();
                    userOpt = Optional.of(userRepository.save(newUser));
                }
            }

            User user = userOpt.get();
            if (!user.getEnabled()) {
                throw CustomException.builder()
                        .status(HttpStatus.FORBIDDEN)
                        .error("Forbidden")
                        .message("Tài khoản này đã bị khóa!")
                        .build();
            }

            String accessToken = jwtService.generateToken(user);
            refreshTokenService.deleteByUserId(user.getId());
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

            return AuthenticationResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken.getToken())
                    .registered(true)
                    .build();

        } catch (CustomException ce) {
            throw ce;
        } catch (Exception e) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Đăng nhập bằng Google thất bại: " + e.getMessage())
                    .build();
        }
    }
}
