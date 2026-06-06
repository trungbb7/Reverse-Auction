package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.entity.SystemSetting;
import vn.edu.hcmuaf.reverseauction.repository.SystemSettingRepository;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSettingController {

    private final SystemSettingRepository systemSettingRepository;

    @GetMapping("/commission-rate")
    public ResponseEntity<BigDecimal> getCommissionRate() {
        BigDecimal rate = systemSettingRepository.findById("COMMISSION_RATE")
                .map(s -> {
                    try {
                        return new BigDecimal(s.getValue());
                    } catch (Exception e) {
                        return BigDecimal.valueOf(10);
                    }
                })
                .orElse(BigDecimal.valueOf(10));
        return ResponseEntity.ok(rate);
    }

    @PutMapping("/commission-rate")
    public ResponseEntity<BigDecimal> updateCommissionRate(@RequestParam BigDecimal rate) {
        if (rate == null || rate.compareTo(BigDecimal.ZERO) < 0 || rate.compareTo(BigDecimal.valueOf(100)) > 0) {
            return ResponseEntity.badRequest().build();
        }
        SystemSetting setting = SystemSetting.builder()
                .key("COMMISSION_RATE")
                .value(rate.toString())
                .build();
        systemSettingRepository.save(setting);
        return ResponseEntity.ok(rate);
    }
}
