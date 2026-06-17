package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.NotificationResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.response.PageResponse;
import vn.edu.hcmuaf.reverseauction.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<PageResponse<NotificationResponseDTO>> getNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        String email = authentication.getName();
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PageResponse<NotificationResponseDTO> response = notificationService.getNotificationsForUser(email, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        String email = authentication.getName();
        long count = notificationService.getUnreadCount(email);
        return ResponseEntity.ok(count);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(Authentication authentication, @PathVariable Long id) {
        String email = authentication.getName();
        notificationService.markAsRead(id, email);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        String email = authentication.getName();
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok().build();
    }
}
