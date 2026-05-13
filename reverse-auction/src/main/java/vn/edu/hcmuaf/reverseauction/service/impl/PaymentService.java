package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.CreatePaymentRequest;
import vn.edu.hcmuaf.reverseauction.dto.PaymentResponse;
import vn.edu.hcmuaf.reverseauction.entity.Order;
import vn.edu.hcmuaf.reverseauction.entity.OrderStatus;
import vn.edu.hcmuaf.reverseauction.entity.Payment;
import vn.edu.hcmuaf.reverseauction.repository.OrderRepository;
import vn.edu.hcmuaf.reverseauction.repository.PaymentRepository;
import vn.edu.hcmuaf.reverseauction.utils.PaymentUtils;

import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentUtils paymentUtils;

    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request) throws NoSuchAlgorithmException, InvalidKeyException {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + request.orderId()));

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(request.amount());
        payment.setBankCode(normalizeBankCode(request.bankCode()));
        payment.setPaymentUrl(paymentUtils.buildPaymentUrl(request.amount(), request.bankCode()));
        payment.setCreatedAt(Instant.now());
        payment = paymentRepository.save(payment);

        order.setStatus(OrderStatus.AWAITING_PAYMENT);
        orderRepository.save(order);

        return new PaymentResponse(
                payment.getId(),
                payment.getOrder().getId(),
                payment.getAmount(),
                payment.getBankCode(),
                payment.getPaymentUrl(),
                payment.getCreatedAt()
        );
    }

    @Transactional
    public void handleCallback(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if ("success".equalsIgnoreCase(status)) {
            order.setStatus(OrderStatus.PAID);
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
        }
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> listPayments() {
        return paymentRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(p -> new PaymentResponse(
                        p.getId(),
                        p.getOrder().getId(),
                        p.getAmount(),
                        p.getBankCode(),
                        p.getPaymentUrl(),
                        p.getCreatedAt()))
                .toList();
    }


    private String normalizeBankCode(String bankCode) {
        if (bankCode == null || bankCode.isBlank()) {
            return "NCB";
        }
        return bankCode.trim().toUpperCase(Locale.ROOT);
    }
}
