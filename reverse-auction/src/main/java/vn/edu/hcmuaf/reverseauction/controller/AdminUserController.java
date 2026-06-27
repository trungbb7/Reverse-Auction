package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.UserDTO;
import vn.edu.hcmuaf.reverseauction.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/{id}/toggle-block")
    public ResponseEntity<Void> toggleUserBlock(@PathVariable Long id) {
        userService.toggleUserBlock(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/kyc")
    public ResponseEntity<UserDTO> verifyKyc(
            @PathVariable Long id,
            @RequestParam("status") vn.edu.hcmuaf.reverseauction.entity.KycStatus status,
            @RequestParam(value = "message", required = false) String message) {
        return ResponseEntity.ok(userService.verifyKyc(id, status, message));
    }
}
