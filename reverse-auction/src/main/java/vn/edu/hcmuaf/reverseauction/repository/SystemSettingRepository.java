package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.reverseauction.entity.SystemSetting;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, String> {
}
