package vn.edu.hcmuaf.reverseauction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAddressDTO {
    private Long id;
    private String recipientName;
    private String phone;
    private String address;
    private boolean isDefault;
}
