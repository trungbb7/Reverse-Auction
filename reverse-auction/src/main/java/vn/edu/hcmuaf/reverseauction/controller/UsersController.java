package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.UserDTO;
import vn.edu.hcmuaf.reverseauction.service.impl.UserServiceImpl;

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
}
