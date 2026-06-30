package vn.edu.hcmuaf.reverseauction.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.TransactionDTO;
import vn.edu.hcmuaf.reverseauction.service.TransactionService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/transactions")
@Tag(name = "Admin Transactions Management")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/withdrawals/pending")
    public ResponseEntity<List<TransactionDTO>> getPendingWithdrawals() {
        return ResponseEntity.ok(transactionService.getPendingWithdrawals());
    }

    @PostMapping("/withdrawals/{id}/approve")
    public ResponseEntity<TransactionDTO> approveWithdrawal(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.approveWithdrawal(id));
    }

    @PostMapping("/withdrawals/{id}/reject")
    public ResponseEntity<TransactionDTO> rejectWithdrawal(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(transactionService.rejectWithdrawal(id, reason));
    }
}
