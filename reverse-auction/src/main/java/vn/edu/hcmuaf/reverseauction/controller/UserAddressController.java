package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.UserAddressDTO;
import vn.edu.hcmuaf.reverseauction.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users/me/addresses")
@RequiredArgsConstructor
public class UserAddressController {

    private final UserService userService;

    @GetMapping
    public List<UserAddressDTO> getAddresses() {
        return userService.getAddresses();
    }

    @PostMapping
    public UserAddressDTO addAddress(@RequestBody UserAddressDTO dto) {
        return userService.addAddress(dto);
    }

    @PutMapping("/{id}")
    public UserAddressDTO updateAddress(@PathVariable Long id, @RequestBody UserAddressDTO dto) {
        return userService.updateAddress(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteAddress(@PathVariable Long id) {
        userService.deleteAddress(id);
    }

    @PutMapping("/{id}/default")
    public void setDefaultAddress(@PathVariable Long id) {
        userService.setDefaultAddress(id);
    }
}
