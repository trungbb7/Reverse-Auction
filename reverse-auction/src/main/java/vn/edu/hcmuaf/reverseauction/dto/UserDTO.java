package vn.edu.hcmuaf.reverseauction.dto;
import lombok.*;
import vn.edu.hcmuaf.reverseauction.entity.AuthProvider;
import vn.edu.hcmuaf.reverseauction.entity.KycStatus;
import vn.edu.hcmuaf.reverseauction.entity.Role;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private long id;
    private String fullName;
    private String phone;
    private String email;

    private String address;
    private String imageUrl;

    private Role role;
    private String description;
    private boolean enabled;
    private Boolean verified;
    private AuthProvider provider;
    private BigDecimal balance;


    private String identityNumber;

    private String frontIdentity;
    private String backIdentity;
    private String businessLicense;
    private KycStatus kycStatus;
    private String kycMessage;
}
