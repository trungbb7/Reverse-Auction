package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.reverseauction.entity.ComplaintStatus;
import vn.edu.hcmuaf.reverseauction.entity.Complaint;

import java.util.List;
import java.util.Optional;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findAllByBuyer_IdOrderByCreatedAtDesc(Long buyerId);

    List<Complaint> findAllByOrderByCreatedAtDesc();

    Optional<Complaint> findByIdAndBuyer_Id(Long id, Long buyerId);

    List<Complaint> findAllByStatusOrderByCreatedAtDesc(ComplaintStatus status);
}
