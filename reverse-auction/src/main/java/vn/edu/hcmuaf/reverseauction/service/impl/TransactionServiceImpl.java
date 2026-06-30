package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.TransactionDTO;
import vn.edu.hcmuaf.reverseauction.entity.*;
import vn.edu.hcmuaf.reverseauction.exception.CustomException;
import vn.edu.hcmuaf.reverseauction.repository.TransactionRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.service.TransactionService;
import vn.edu.hcmuaf.reverseauction.utils.PaymentUtils;

import java.math.BigDecimal;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final PaymentUtils paymentUtils;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> CustomException.builder()
                        .status(HttpStatus.UNAUTHORIZED)
                        .error("Unauthorized")
                        .message("Người dùng chưa đăng nhập hoặc không tồn tại")
                        .build());
    }

    private TransactionDTO mapToDTO(Transaction t) {
        return TransactionDTO.builder()
                .id(t.getId())
                .userId(t.getUser().getId())
                .userEmail(t.getUser().getEmail())
                .userFullName(t.getUser().getFullName())
                .amount(t.getAmount())
                .type(t.getType())
                .status(t.getStatus())
                .code(t.getCode())
                .description(t.getDescription())
                .createdAt(t.getCreatedAt())
                .bankName(t.getBankName())
                .accountNumber(t.getAccountNumber())
                .accountHolder(t.getAccountHolder())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionDTO> getMyTransactions() {
        User currentUser = getCurrentUser();
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TransactionDTO createInstantTopup(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Số tiền nạp phải lớn hơn 0")
                    .build();
        }
        User currentUser = getCurrentUser();

        Transaction transaction = Transaction.builder()
                .user(currentUser)
                .amount(amount)
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.SUCCESS)
                .code("TX_" + System.currentTimeMillis())
                .description("Nạp tiền nhanh (Simulated)")
                .createdAt(LocalDateTime.now())
                .build();

        if (currentUser.getBalance() == null) {
            currentUser.setBalance(BigDecimal.ZERO);
        }
        currentUser.setBalance(currentUser.getBalance().add(amount));
        userRepository.save(currentUser);

        Transaction saved = transactionRepository.save(transaction);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public TransactionDTO initVNPayTopup(BigDecimal amount, String bankCode) throws NoSuchAlgorithmException, InvalidKeyException {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Số tiền nạp phải lớn hơn 0")
                    .build();
        }
        User currentUser = getCurrentUser();

        String tempCode = "TOPUP_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        Transaction transaction = Transaction.builder()
                .user(currentUser)
                .amount(amount)
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.PENDING)
                .code(tempCode)
                .description("Yêu cầu nạp tiền qua VNPay")
                .createdAt(LocalDateTime.now())
                .build();

        Transaction saved = transactionRepository.save(transaction);

        // Build VNPay URL using existing paymentUtils
        // paymentUtils.buildPaymentUrl needs amount in Long, which will be multiplied by 100 in the util
        // Note: amount is in VND, e.g. 50000.
        String paymentUrl = paymentUtils.buildPaymentUrl(amount.longValue(), bankCode, saved.getId(), "TOPUP");
        
        saved.setDescription("Thanh toán nạp tiền VNPay");
        // Store URL in a way we can retrieve (we can just return it in the DTO code/description field)
        TransactionDTO dto = mapToDTO(saved);
        // Put paymentUrl inside the description field of DTO temporarily for the FE to navigate to
        dto.setDescription(paymentUrl);

        return dto;
    }

    @Override
    @Transactional
    public TransactionDTO handleVNPayTopupCallback(String txnRef, String status) {
        // txnRef will be TOPUP_<transactionId>
        if (txnRef == null || !txnRef.startsWith("TOPUP_")) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Mã giao dịch không hợp lệ")
                    .build();
        }

        Long transactionId = Long.parseLong(txnRef.replace("TOPUP_", ""));
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> CustomException.builder()
                        .status(HttpStatus.NOT_FOUND)
                        .error("Not Found")
                        .message("Không tìm thấy thông tin giao dịch nạp tiền")
                        .build());

        if (transaction.getStatus() != TransactionStatus.PENDING) {
            return mapToDTO(transaction); // Already processed
        }

        if ("success".equalsIgnoreCase(status)) {
            transaction.setStatus(TransactionStatus.SUCCESS);
            User user = transaction.getUser();
            if (user.getBalance() == null) {
                user.setBalance(BigDecimal.ZERO);
            }
            user.setBalance(user.getBalance().add(transaction.getAmount()));
            userRepository.save(user);
        } else {
            transaction.setStatus(TransactionStatus.FAILED);
        }

        Transaction saved = transactionRepository.save(transaction);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public TransactionDTO requestWithdrawal(BigDecimal amount, String bankName, String accountNumber, String accountHolder) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Số tiền rút phải lớn hơn 0")
                    .build();
        }
        if (bankName == null || bankName.trim().isEmpty() ||
                accountNumber == null || accountNumber.trim().isEmpty() ||
                accountHolder == null || accountHolder.trim().isEmpty()) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng")
                    .build();
        }

        User currentUser = getCurrentUser();
        if (currentUser.getBalance() == null || currentUser.getBalance().compareTo(amount) < 0) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Số dư khả dụng không đủ")
                    .build();
        }

        // Deduct balance immediately (hold it)
        currentUser.setBalance(currentUser.getBalance().subtract(amount));
        userRepository.save(currentUser);

        Transaction transaction = Transaction.builder()
                .user(currentUser)
                .amount(amount.negate()) // Withdrawal is negative
                .type(TransactionType.WITHDRAW)
                .status(TransactionStatus.PENDING)
                .code("W_" + System.currentTimeMillis())
                .description("Yêu cầu rút tiền về " + bankName)
                .createdAt(LocalDateTime.now())
                .bankName(bankName)
                .accountNumber(accountNumber)
                .accountHolder(accountHolder)
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionDTO> getAllTransactions() {
        return transactionRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionDTO> getPendingWithdrawals() {
        return transactionRepository.findByTypeAndStatusOrderByCreatedAtDesc(TransactionType.WITHDRAW, TransactionStatus.PENDING)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TransactionDTO approveWithdrawal(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> CustomException.builder()
                        .status(HttpStatus.NOT_FOUND)
                        .error("Not Found")
                        .message("Không tìm thấy giao dịch")
                        .build());

        if (transaction.getType() != TransactionType.WITHDRAW || transaction.getStatus() != TransactionStatus.PENDING) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Giao dịch không hợp lệ để duyệt")
                    .build();
        }

        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setDescription("Yêu cầu rút tiền đã được duyệt và chuyển khoản");
        Transaction saved = transactionRepository.save(transaction);
        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public TransactionDTO rejectWithdrawal(Long id, String reason) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> CustomException.builder()
                        .status(HttpStatus.NOT_FOUND)
                        .error("Not Found")
                        .message("Không tìm thấy giao dịch")
                        .build());

        if (transaction.getType() != TransactionType.WITHDRAW || transaction.getStatus() != TransactionStatus.PENDING) {
            throw CustomException.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .error("Bad Request")
                    .message("Giao dịch không hợp lệ để từ chối")
                    .build();
        }

        transaction.setStatus(TransactionStatus.FAILED);
        String desc = "Yêu cầu rút tiền bị từ chối";
        if (reason != null && !reason.trim().isEmpty()) {
            desc += ": " + reason;
        }
        transaction.setDescription(desc);

        // Refund user balance
        User user = transaction.getUser();
        BigDecimal refundAmount = transaction.getAmount().abs(); // Amount is stored as negative
        if (user.getBalance() == null) {
            user.setBalance(BigDecimal.ZERO);
        }
        user.setBalance(user.getBalance().add(refundAmount));
        userRepository.save(user);

        Transaction saved = transactionRepository.save(transaction);
        return mapToDTO(saved);
    }
}
