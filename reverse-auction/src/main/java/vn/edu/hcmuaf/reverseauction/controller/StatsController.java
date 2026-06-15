package vn.edu.hcmuaf.reverseauction.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmuaf.reverseauction.dto.AdminStatsResponse;
import vn.edu.hcmuaf.reverseauction.dto.SellerStatsResponse;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.service.StatsService;

@RestController
@RequestMapping("/api/stats")
@Tag(name = "Statistics")
@RequiredArgsConstructor
public class StatsController {
    private final StatsService statsService;
    private final UserRepository userRepository;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        return ResponseEntity.ok(statsService.getAdminStats());
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SellerStatsResponse> getSellerStats(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(statsService.getSellerStats(user.getId()));
    }
}
