package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.dto.UserDTO;

import java.util.List;

public interface UserService {
    UserDTO getCurrentUser();
    UserDTO updateCurrentUser(UserDTO request);
    List<UserDTO> listChatUsers();
}
