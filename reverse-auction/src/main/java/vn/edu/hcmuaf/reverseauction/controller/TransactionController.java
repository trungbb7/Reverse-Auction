package vn.edu.hcmuaf.reverseauction.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.TransactionDTO;
import vn.edu.hcmuaf.reverseauction.dto.request.WithdrawRequest;
import vn.edu.hcmuaf.reverseauction.service.TransactionService;

import java.math.BigDecimal;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@Tag(name = "Transactions & Wallet")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/me")
    public ResponseEntity<List<TransactionDTO>> getMyTransactions() {
        return ResponseEntity.ok(transactionService.getMyTransactions());
    }

    @PostMapping("/deposit/instant")
    public ResponseEntity<TransactionDTO> depositInstant(@RequestParam BigDecimal amount) {
        return ResponseEntity.ok(transactionService.createInstantTopup(amount));
    }

    @PostMapping("/deposit/vnpay")
    public ResponseEntity<TransactionDTO> depositVNPay(
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String bankCode) throws NoSuchAlgorithmException, InvalidKeyException {
        return ResponseEntity.ok(transactionService.initVNPayTopup(amount, bankCode));
    }

    @PostMapping("/deposit/callback")
    public ResponseEntity<TransactionDTO> depositCallback(
            @RequestParam String txnRef,
            @RequestParam String status) {
        return ResponseEntity.ok(transactionService.handleVNPayTopupCallback(txnRef, status));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<TransactionDTO> withdraw(@RequestBody WithdrawRequest request) {
        return ResponseEntity.ok(transactionService.requestWithdrawal(
                request.getAmount(),
                request.getBankName(),
                request.getAccountNumber(),
                request.getAccountHolder()
        ));
    }
}
