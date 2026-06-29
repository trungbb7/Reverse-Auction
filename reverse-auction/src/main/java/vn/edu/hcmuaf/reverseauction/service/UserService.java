package vn.edu.hcmuaf.reverseauction.service;

import java.util.List;
import vn.edu.hcmuaf.reverseauction.dto.UserDTO;
import vn.edu.hcmuaf.reverseauction.dto.request.ChangePasswordRequest;

public interface UserService {
    UserDTO getCurrentUser();
    UserDTO updateCurrentUser(UserDTO request);
    List<UserDTO> getAllUsers();
    void toggleUserBlock(Long id);
    List<UserDTO> listChatUsers();
    UserDTO submitKyc(org.springframework.web.multipart.MultipartFile front, org.springframework.web.multipart.MultipartFile back, String cccdNumber);
    UserDTO verifyKyc(Long userId, vn.edu.hcmuaf.reverseauction.entity.KycStatus status, String message);
    void changePassword(ChangePasswordRequest request);
    UserDTO topupBalance(java.math.BigDecimal amount);
}
