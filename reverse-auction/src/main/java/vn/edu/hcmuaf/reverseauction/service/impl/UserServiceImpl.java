package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.UserDTO;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.service.UserService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

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

        userRepository.save(user);

        return mapToDTO(user);
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

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .id(user.getId())
                .role(user.getRole())
                .build();
    }

}
