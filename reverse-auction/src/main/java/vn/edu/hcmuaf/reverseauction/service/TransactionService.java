package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.dto.TransactionDTO;
import java.math.BigDecimal;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.List;

public interface TransactionService {
    List<TransactionDTO> getMyTransactions();
    TransactionDTO createInstantTopup(BigDecimal amount);
    TransactionDTO initVNPayTopup(BigDecimal amount, String bankCode) throws NoSuchAlgorithmException, InvalidKeyException;
    TransactionDTO handleVNPayTopupCallback(String txnRef, String status);
    TransactionDTO requestWithdrawal(BigDecimal amount, String bankName, String accountNumber, String accountHolder);
    
    // Admin features
    List<TransactionDTO> getAllTransactions();
    List<TransactionDTO> getPendingWithdrawals();
    TransactionDTO approveWithdrawal(Long id);
    TransactionDTO rejectWithdrawal(Long id, String reason);
}
