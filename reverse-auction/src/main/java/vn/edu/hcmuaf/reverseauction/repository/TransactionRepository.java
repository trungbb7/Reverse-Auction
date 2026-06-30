package vn.edu.hcmuaf.reverseauction.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.hcmuaf.reverseauction.entity.Transaction;
import vn.edu.hcmuaf.reverseauction.entity.TransactionStatus;
import vn.edu.hcmuaf.reverseauction.entity.TransactionType;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Transaction> findByTypeAndStatusOrderByCreatedAtDesc(TransactionType type, TransactionStatus status);
    Optional<Transaction> findByCode(String code);
}
