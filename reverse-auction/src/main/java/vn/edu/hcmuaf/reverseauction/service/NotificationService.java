package vn.edu.hcmuaf.reverseauction.service;

import org.springframework.data.domain.Pageable;
import vn.edu.hcmuaf.reverseauction.dto.NotificationResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.response.PageResponse;
import vn.edu.hcmuaf.reverseauction.entity.User;

public interface NotificationService {
    NotificationResponseDTO createAndSendNotification(User user, String title, String content, String type, Long relatedId);
    PageResponse<NotificationResponseDTO> getNotificationsForUser(String email, Pageable pageable);
    long getUnreadCount(String email);
    void markAsRead(Long id, String email);
    void markAllAsRead(String email);
}
