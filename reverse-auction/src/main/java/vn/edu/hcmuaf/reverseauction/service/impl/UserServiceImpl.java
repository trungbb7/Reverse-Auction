package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.UserDTO;
import vn.edu.hcmuaf.reverseauction.dto.request.ChangePasswordRequest;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.entity.AuthProvider;
import vn.edu.hcmuaf.reverseauction.exception.CustomException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.service.UserService;

import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
        user.setEnabled(!user.getEnabled());
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> listChatUsers() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAdmin = vn.edu.hcmuaf.reverseauction.entity.Role.ROLE_ADMIN.equals(currentUser.getRole());

        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "fullName"))
                .stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .filter(user -> isAdmin || !vn.edu.hcmuaf.reverseauction.entity.Role.ROLE_ADMIN.equals(user.getRole()))
                .map(this::mapToDTO)
                .toList();
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .id(user.getId())
                .role(user.getRole())
                .enabled(user.getEnabled())
                .verified(user.getVerified())
                .provider(user.getProvider())
                .balance(user.getBalance())
                .build();
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
}
