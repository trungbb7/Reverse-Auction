package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.UserDTO;
import vn.edu.hcmuaf.reverseauction.dto.request.ChangePasswordRequest;
import vn.edu.hcmuaf.reverseauction.entity.AuthProvider;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.exception.CustomException;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.service.FileStorageService;
import vn.edu.hcmuaf.reverseauction.service.UserService;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    @Override
    public UserDTO getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mapToDTO(user);
    }

    @Override
    public UserDTO updateCurrentUser(UserDTO request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setImageUrl(request.getImageUrl());
        user.setDescription(request.getDescription());
        user.setAddress(request.getAddress());

        userRepository.save(user);

        return mapToDTO(user);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .filter(user -> !vn.edu.hcmuaf.reverseauction.entity.Role.ROLE_ADMIN.equals(user.getRole()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void toggleUserBlock(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> listChatUsers() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "fullName"))
                .stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getProvider() == AuthProvider.GOOGLE) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Tài khoản đăng nhập bằng Google không thể đổi mật khẩu.")
                    .build();
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Mật khẩu cũ không chính xác.")
                    .build();
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public UserDTO topupBalance(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Số tiền nạp phải lớn hơn 0")
                    .build();
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBalance() == null) {
            user.setBalance(BigDecimal.ZERO);
        }
        user.setBalance(user.getBalance().add(amount));
        User saved = userRepository.save(user);
        return mapToDTO(saved);
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .id(user.getId())
                .role(user.getRole())
                .enabled(user.getEnabled())
                .imageUrl(user.getImageUrl())
                .description(user.getDescription())
                .verified(user.getVerified())
                .provider(user.getProvider())
                .balance(user.getBalance())
                .cccdNumber(user.getCccdNumber())
                .cccdFrontImage(user.getCccdFrontImage())
                .cccdBackImage(user.getCccdBackImage())
                .kycStatus(user.getKycStatus())
                .kycMessage(user.getKycMessage())
                .build();
    }

    @Override
    public UserDTO submitKyc(org.springframework.web.multipart.MultipartFile front, org.springframework.web.multipart.MultipartFile back, String cccdNumber) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String frontPath = fileStorageService.storeFile(front);
        String backPath = fileStorageService.storeFile(back);

        user.setCccdNumber(cccdNumber);
        user.setCccdFrontImage(frontPath);
        user.setCccdBackImage(backPath);
        user.setKycStatus(vn.edu.hcmuaf.reverseauction.entity.KycStatus.PENDING);
        user.setKycMessage(null);

        userRepository.save(user);

        return mapToDTO(user);
    }

    @Override
    public UserDTO verifyKyc(Long userId, vn.edu.hcmuaf.reverseauction.entity.KycStatus status, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setKycStatus(status);
        user.setKycMessage(message);

        userRepository.save(user);

        return mapToDTO(user);
    }

}
