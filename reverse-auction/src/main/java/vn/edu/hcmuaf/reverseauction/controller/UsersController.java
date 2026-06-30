package vn.edu.hcmuaf.reverseauction.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.UserDTO;
import vn.edu.hcmuaf.reverseauction.dto.request.ChangePasswordRequest;
import vn.edu.hcmuaf.reverseauction.dto.request.SubmitKycRequest;
import vn.edu.hcmuaf.reverseauction.service.impl.UserServiceImpl;

import java.math.BigDecimal;
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
    public UserDTO topupBalance(@RequestParam BigDecimal amount) {
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

    @PostMapping(value = "/kyc")
    public UserDTO submitKyc(@RequestBody SubmitKycRequest request) {
        return userService.submitKyc(request.getIdentityNumber(), request.getFrontIdentity(), request.getBackIdentity(), request.getBusinessLicense());
    }

    @PostMapping("/me/request-email-update")
    public void requestEmailUpdate(@RequestParam String newEmail) {
        userService.requestEmailUpdate(newEmail);
    }

    @PostMapping("/me/confirm-email-update")
    public void confirmEmailUpdate(@RequestParam String code) {
        userService.confirmEmailUpdate(code);
    }
}
