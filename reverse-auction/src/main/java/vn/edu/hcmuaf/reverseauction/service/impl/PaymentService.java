package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.CreatePaymentRequest;
import vn.edu.hcmuaf.reverseauction.dto.PaymentResponse;
import vn.edu.hcmuaf.reverseauction.entity.Order;
import vn.edu.hcmuaf.reverseauction.entity.Payment;
import vn.edu.hcmuaf.reverseauction.repository.OrderRepository;
import vn.edu.hcmuaf.reverseauction.repository.PaymentRepository;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + request.orderId()));

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(request.amount());
        payment.setBankCode(normalizeBankCode(request.bankCode()));
        payment.setPaymentUrl(buildPaymentUrl(order.getId(), request.amount(), request.bankCode()));
        payment.setCreatedAt(Instant.now());
        payment = paymentRepository.save(payment);

        order.setStatus("AWAITING_PAYMENT");
        orderRepository.save(order);

        return new PaymentResponse(payment.getId(), payment.getOrder().getId(), payment.getAmount(), payment.getBankCode(), payment.getPaymentUrl(), payment.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> listPayments() {
        return paymentRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(payment -> new PaymentResponse(payment.getId(), payment.getOrder().getId(), payment.getAmount(), payment.getBankCode(), payment.getPaymentUrl(), payment.getCreatedAt()))
                .toList();
    }

    private String buildPaymentUrl(Long orderId, Long amount, String bankCode) {
        return "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=%d&vnp_Amount=%d&vnp_BankCode=%s"
                .formatted(orderId, amount == null ? 0L : amount, normalizeBankCode(bankCode));
    }

    private String normalizeBankCode(String bankCode) {
        if (bankCode == null || bankCode.isBlank()) {
            return "NCB";
        }
        return bankCode.trim().toUpperCase(Locale.ROOT);
    }
}
