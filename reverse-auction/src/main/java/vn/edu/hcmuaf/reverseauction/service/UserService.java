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
    void changePassword(ChangePasswordRequest request);
    UserDTO topupBalance(java.math.BigDecimal amount);
}
