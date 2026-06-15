package vn.edu.hcmuaf.reverseauction.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.UserDTO;
import vn.edu.hcmuaf.reverseauction.dto.request.ChangePasswordRequest;
import vn.edu.hcmuaf.reverseauction.service.impl.UserServiceImpl;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UsersController {

    private final UserServiceImpl userService;

    @GetMapping("/me")
    public UserDTO getMyProfile() {
        return userService.getCurrentUser();
    }

    @PutMapping("/me")
    public UserDTO updateMyProfile(@RequestBody UserDTO request) {
        return userService.updateCurrentUser(request);
    }

    @PostMapping("/me/topup")
    public UserDTO topupBalance(@RequestParam java.math.BigDecimal amount) {
        return userService.topupBalance(amount);
    }

    @PutMapping("/change-password")
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
    }

    @GetMapping("/chat-contacts")
    public List<UserDTO> listChatContacts() {
        return userService.listChatUsers();
    }
}
