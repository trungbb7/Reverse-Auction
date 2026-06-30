package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.reverseauction.entity.EmailUpdateVerification;
import vn.edu.hcmuaf.reverseauction.entity.User;

import java.util.Optional;

@Repository
public interface EmailUpdateVerificationRepository extends JpaRepository<EmailUpdateVerification, Long> {
    Optional<EmailUpdateVerification> findByUser(User user);
    Optional<EmailUpdateVerification> findByUserAndCode(User user, String code);
    void deleteByUser(User user);
}
