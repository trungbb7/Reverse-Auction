package vn.edu.hcmuaf.reverseauction.service;

import java.util.List;
import vn.edu.hcmuaf.reverseauction.dto.UserDTO;

public interface UserService {
    UserDTO getCurrentUser();
    UserDTO updateCurrentUser(UserDTO request);
    List<UserDTO> getAllUsers();
    void toggleUserBlock(Long id);
    List<UserDTO> listChatUsers();
}
