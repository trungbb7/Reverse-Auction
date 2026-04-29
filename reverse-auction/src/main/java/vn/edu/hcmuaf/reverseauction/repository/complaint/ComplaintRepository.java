package vn.edu.hcmuaf.reverseauction.repository.complaint;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.reverseauction.entity.ComplaintEntity;

public interface ComplaintRepository extends JpaRepository<ComplaintEntity, Long> {
}
