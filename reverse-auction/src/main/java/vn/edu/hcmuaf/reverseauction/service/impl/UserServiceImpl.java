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
import vn.edu.hcmuaf.reverseauction.dto.request.SubmitKycRequest;
import vn.edu.hcmuaf.reverseauction.dto.UserAddressDTO;
import vn.edu.hcmuaf.reverseauction.entity.AuthProvider;
import vn.edu.hcmuaf.reverseauction.entity.KycStatus;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.entity.EmailUpdateVerification;
import vn.edu.hcmuaf.reverseauction.entity.UserAddress;
import vn.edu.hcmuaf.reverseauction.exception.CustomException;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.repository.EmailUpdateVerificationRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserAddressRepository;
import vn.edu.hcmuaf.reverseauction.service.FileStorageService;
import vn.edu.hcmuaf.reverseauction.service.UserService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final EmailUpdateVerificationRepository emailUpdateVerificationRepository;
    private final UserAddressRepository userAddressRepository;
    private final EmailServiceImpl emailService;

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

        if (user.getProvider() == AuthProvider.LOCAL) {
            if (request.getOldPassword() == null || request.getOldPassword().trim().isEmpty()) {
                throw CustomException.builder()
                        .status(HttpStatus.BAD_REQUEST)
                        .error("Bad Request")
                        .message("Mật khẩu cũ không được để trống.")
                        .build();
            }
            if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                throw CustomException.builder()
                        .status(HttpStatus.BAD_REQUEST)
                        .error("Bad Request")
                        .message("Mật khẩu cũ không chính xác.")
                        .build();
            }
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
                .identityNumber(user.getIdentityNumber())
                .frontIdentity(user.getIdentityFrontImage())
                .backIdentity(user.getIdentityBackImage())
                .businessLicense(user.getBusinessLicense())
                .kycStatus(user.getKycStatus())
                .kycMessage(user.getKycMessage())
                .build();
    }

    @Override
    public UserDTO submitKyc(String identityNumber, String frontIdentity, String backIdentity, String businessLicense) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

;

        user.setIdentityNumber(identityNumber);
        user.setIdentityFrontImage(frontIdentity);
        user.setIdentityBackImage(backIdentity);
        user.setBusinessLicense(businessLicense);
        user.setKycStatus(KycStatus.PENDING);
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

    @Override
    @Transactional
    public void requestEmailUpdate(String newEmail) {
        if (newEmail == null || newEmail.trim().isEmpty()) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Email mới không được để trống.")
                    .build();
        }
        
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (newEmail.equalsIgnoreCase(currentEmail)) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Email mới không được trùng với email hiện tại.")
                    .build();
        }

        if (userRepository.findByEmail(newEmail).isPresent()) {
            throw CustomException.builder()
                    .status(HttpStatus.CONFLICT)
                    .error("Conflict")
                    .message("Email này đã được sử dụng bởi tài khoản khác.")
                    .build();
        }

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        emailUpdateVerificationRepository.deleteByUser(user);

        String code = String.format("%06d", new Random().nextInt(1000000));

        EmailUpdateVerification verification = EmailUpdateVerification.builder()
                .user(user)
                .newEmail(newEmail)
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();

        emailUpdateVerificationRepository.save(verification);

        emailService.sendEmailUpdateVerificationCode(newEmail, code);
    }

    @Override
    @Transactional
    public void confirmEmailUpdate(String code) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        EmailUpdateVerification verification = emailUpdateVerificationRepository.findByUser(user)
                .orElseThrow(() -> CustomException.builder()
                        .status(HttpStatus.BAD_REQUEST)
                        .error("Bad Request")
                        .message("Không tìm thấy yêu cầu đổi email. Vui lòng thử lại.")
                        .build());

        if (verification.isExpired()) {
            emailUpdateVerificationRepository.delete(verification);
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Mã xác nhận đã hết hạn. Vui lòng yêu cầu gửi lại.")
                    .build();
        }

        if (!verification.getCode().equals(code)) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Mã xác nhận không chính xác.")
                    .build();
        }

        if (userRepository.findByEmail(verification.getNewEmail()).isPresent()) {
            emailUpdateVerificationRepository.delete(verification);
            throw CustomException.builder()
                    .status(HttpStatus.CONFLICT)
                    .error("Conflict")
                    .message("Email mới đã được sử dụng bởi tài khoản khác.")
                    .build();
        }

        user.setEmail(verification.getNewEmail());
        user.setVerified(true);
        userRepository.save(user);

        emailUpdateVerificationRepository.delete(verification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserAddressDTO> getAddresses() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userAddressRepository.findByUser(user).stream()
                .map(this::mapAddressToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserAddressDTO addAddress(UserAddressDTO dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserAddress> currentAddresses = userAddressRepository.findByUser(user);
        boolean isFirstAddress = currentAddresses.isEmpty();

        boolean makeDefault = isFirstAddress || dto.isDefault();

        if (makeDefault) {
            for (UserAddress addr : currentAddresses) {
                if (addr.isDefault()) {
                    addr.setDefault(false);
                    userAddressRepository.save(addr);
                }
            }
        }

        UserAddress address = UserAddress.builder()
                .user(user)
                .recipientName(dto.getRecipientName())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .isDefault(makeDefault)
                .build();

        UserAddress saved = userAddressRepository.save(address);
        return mapAddressToDTO(saved);
    }

    @Override
    @Transactional
    public UserAddressDTO updateAddress(Long id, UserAddressDTO dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserAddress address = userAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw CustomException.builder()
                    .status(HttpStatus.FORBIDDEN)
                    .error("Forbidden")
                    .message("Bạn không có quyền sửa địa chỉ này.")
                    .build();
        }

        address.setRecipientName(dto.getRecipientName());
        address.setPhone(dto.getPhone());
        address.setAddress(dto.getAddress());

        if (dto.isDefault() && !address.isDefault()) {
            List<UserAddress> currentAddresses = userAddressRepository.findByUser(user);
            for (UserAddress addr : currentAddresses) {
                if (addr.isDefault()) {
                    addr.setDefault(false);
                    userAddressRepository.save(addr);
                }
            }
            address.setDefault(true);
        }

        UserAddress saved = userAddressRepository.save(address);
        return mapAddressToDTO(saved);
    }

    @Override
    @Transactional
    public void deleteAddress(Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserAddress address = userAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw CustomException.builder()
                    .status(HttpStatus.FORBIDDEN)
                    .error("Forbidden")
                    .message("Bạn không có quyền xóa địa chỉ này.")
                    .build();
        }

        boolean wasDefault = address.isDefault();
        userAddressRepository.delete(address);

        if (wasDefault) {
            List<UserAddress> remaining = userAddressRepository.findByUser(user);
            if (!remaining.isEmpty()) {
                UserAddress newDefault = remaining.get(0);
                newDefault.setDefault(true);
                userAddressRepository.save(newDefault);
            }
        }
    }

    @Override
    @Transactional
    public void setDefaultAddress(Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserAddress address = userAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw CustomException.builder()
                    .status(HttpStatus.FORBIDDEN)
                    .error("Forbidden")
                    .message("Bạn không có quyền thao tác trên địa chỉ này.")
                    .build();
        }

        if (!address.isDefault()) {
            List<UserAddress> currentAddresses = userAddressRepository.findByUser(user);
            for (UserAddress addr : currentAddresses) {
                if (addr.isDefault()) {
                    addr.setDefault(false);
                    userAddressRepository.save(addr);
                }
            }
            address.setDefault(true);
            userAddressRepository.save(address);
        }
    }

    private UserAddressDTO mapAddressToDTO(UserAddress address) {
        return UserAddressDTO.builder()
                .id(address.getId())
                .recipientName(address.getRecipientName())
                .phone(address.getPhone())
                .address(address.getAddress())
                .isDefault(address.isDefault())
                .build();
    }
}
