package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.CreatePaymentRequest;
import vn.edu.hcmuaf.reverseauction.dto.PaymentResponse;
import vn.edu.hcmuaf.reverseauction.entity.*;
import vn.edu.hcmuaf.reverseauction.repository.OrderRepository;
import vn.edu.hcmuaf.reverseauction.repository.PaymentRepository;
import vn.edu.hcmuaf.reverseauction.repository.PaymentSessionRepository;
import vn.edu.hcmuaf.reverseauction.service.NotificationService;
import vn.edu.hcmuaf.reverseauction.service.PaymentSessionService;
import vn.edu.hcmuaf.reverseauction.utils.PaymentUtils;

import java.math.BigDecimal;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentSessionServiceImpl implements PaymentSessionService {
    private final PaymentSessionRepository paymentSessionRepository;
    private final OrderRepository orderRepository;
    private final PaymentUtils paymentUtils;
    private final NotificationService notificationService;

    @Transactional
    @Override
    public PaymentSession createSession(
            User buyer,
            List<Order> orders,
            String bankCode
    ) {

        try {

            BigDecimal amount = orders.stream()
                    .map(Order::getFinalPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long txnRef = System.currentTimeMillis() * 1000
                    + ThreadLocalRandom.current().nextInt(0, 1000);
            String code = "PS_" + txnRef;

            String paymentUrl = paymentUtils.buildPaymentUrl(
                    amount.longValue(),
                    bankCode,
                    txnRef, "PS"
            );

            PaymentSession session = new PaymentSession();
            session.setBuyer(buyer);
            session.setAmount(amount);
            session.setCode(code);
            session.setBankCode(normalizeBankCode(bankCode));
            session.setPaymentUrl(paymentUrl);
            session.setCreatedAt(Instant.now());
            session.setOrders(orders);

            return paymentSessionRepository.save(session);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create payment session", e);
        }
    }
    @Transactional
    @Override
    public void handleCallback(String sessionCode, String status) {

        PaymentSession session =
                paymentSessionRepository.findByCode(sessionCode)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Session not found: " + sessionCode));

        if (!"success".equalsIgnoreCase(status)) {
            paymentSessionRepository.save(session);
            return;
        }

        session.setPaidAt(Instant.now());

        for (Order order : session.getOrders()) {

            order.setStatus(OrderStatus.PAID);
            order.setUpdatedAt(LocalDateTime.now());
            order.setPaidAt(LocalDateTime.now());

            String orderTitle =
                    order.getAuction() != null
                            ? order.getAuction().getTitle()
                            : order.getItems().stream()
                            .map(i -> i.getProduct().getName())
                            .distinct()
                            .collect(Collectors.joining(", "));

            notificationService.createAndSendNotification(
                    order.getBuyer(),
                    "Thanh toán đơn hàng thành công",
                    String.format(
                            "Thanh toán cho đơn hàng %s (%s) đã được xác nhận.",
                            order.getCode(),
                            orderTitle
                    ),
                    "ORDER_STATUS_CHANGED",
                    order.getId()
            );

            notificationService.createAndSendNotification(
                    order.getSeller(),
                    "Đơn hàng mới đã được thanh toán",
                    String.format(
                            "Đơn hàng %s (%s) đã được thanh toán.",
                            order.getCode(),
                            orderTitle
                    ),
                    "ORDER_STATUS_CHANGED",
                    order.getId()
            );
        }

        orderRepository.saveAll(session.getOrders());
        paymentSessionRepository.save(session);
    }

    private String normalizeBankCode(String bankCode) {
        if (bankCode == null || bankCode.isBlank()) {
            return "NCB";
        }
        return bankCode.trim().toUpperCase(Locale.ROOT);
    }
}
