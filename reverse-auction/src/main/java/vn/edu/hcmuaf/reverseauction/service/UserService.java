package vn.edu.hcmuaf.reverseauction.service;

import java.util.List;
import vn.edu.hcmuaf.reverseauction.dto.UserDTO;
import vn.edu.hcmuaf.reverseauction.dto.UserAddressDTO;
import vn.edu.hcmuaf.reverseauction.dto.request.ChangePasswordRequest;

public interface UserService {
    UserDTO getCurrentUser();
    UserDTO updateCurrentUser(UserDTO request);
    List<UserDTO> getAllUsers();
    void toggleUserBlock(Long id);
    List<UserDTO> listChatUsers();
    UserDTO submitKyc(String identityNumber, String frontIdentity, String backIdentity, String businessLicense);
    UserDTO verifyKyc(Long userId, vn.edu.hcmuaf.reverseauction.entity.KycStatus status, String message);
    void changePassword(ChangePasswordRequest request);
    UserDTO topupBalance(java.math.BigDecimal amount);
    
    // Email Update
    void requestEmailUpdate(String newEmail);
    void confirmEmailUpdate(String code);

    // Multiple Shipping Addresses
    List<UserAddressDTO> getAddresses();
    UserAddressDTO addAddress(UserAddressDTO dto);
    UserAddressDTO updateAddress(Long id, UserAddressDTO dto);
    void deleteAddress(Long id);
    void setDefaultAddress(Long id);
}
