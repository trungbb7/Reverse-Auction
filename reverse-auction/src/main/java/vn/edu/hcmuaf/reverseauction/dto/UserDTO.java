package vn.edu.hcmuaf.reverseauction.dto;
import lombok.*;
import vn.edu.hcmuaf.reverseauction.entity.Role;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
}
