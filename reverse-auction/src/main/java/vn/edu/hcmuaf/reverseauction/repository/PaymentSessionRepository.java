package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.hcmuaf.reverseauction.entity.PaymentSession;

import java.util.Optional;

public interface PaymentSessionRepository
        extends JpaRepository<PaymentSession, Long> {

    Optional<PaymentSession> findByCode(String code);
}