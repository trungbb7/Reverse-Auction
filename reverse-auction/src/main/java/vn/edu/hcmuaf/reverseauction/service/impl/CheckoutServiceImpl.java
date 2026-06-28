package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.reverseauction.dto.request.CheckoutRequest;
import vn.edu.hcmuaf.reverseauction.dto.response.CheckoutResponse;
import vn.edu.hcmuaf.reverseauction.entity.*;
import vn.edu.hcmuaf.reverseauction.repository.CartRepository;
import vn.edu.hcmuaf.reverseauction.repository.OrderItemRepository;
import vn.edu.hcmuaf.reverseauction.repository.OrderRepository;
import vn.edu.hcmuaf.reverseauction.repository.PaymentRepository;
import vn.edu.hcmuaf.reverseauction.service.CheckoutService;
import vn.edu.hcmuaf.reverseauction.service.PaymentSessionService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckoutServiceImpl implements CheckoutService {
    private final CartRepository cartRepo;
    private final OrderRepository orderRepo;
    private final PaymentSessionService paymentSessionService;

    public CheckoutResponse checkout(CheckoutRequest req, User buyer) {

        List<CartItem> cartItems =
                cartRepo.findAllById(req.getSelectedCartItemIds());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("No cart items selected");
        }

        for (CartItem item : cartItems) {
            if (!item.getUser().getId().equals(buyer.getId())) {
                throw new RuntimeException("Invalid cart item");
            }
        }

        Map<Long, List<CartItem>> grouped =
                cartItems.stream()
                        .collect(Collectors.groupingBy(
                                i -> i.getProduct().getSeller().getId()
                        ));
        Map<Long, BigDecimal> shippingMap = req.getShops().stream()
                .collect(Collectors.toMap(
                        CheckoutRequest.ShopShipping::getShopId,
                        CheckoutRequest.ShopShipping::getShippingFee
                ));
        List<Order> orders = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (var entry : grouped.entrySet()) {

            Long sellerId = entry.getKey();
            List<CartItem> items = entry.getValue();

            Order order = new Order();
            order.setBuyer(buyer);

            User seller = items.get(0).getProduct().getSeller();
            order.setSeller(seller);

            order.setCreatedAt(LocalDateTime.now());

            order.setShippingAddress(req.getAddress());
            order.setBuyerPhone(req.getPhone());
            order.setShippingRecipientName(req.getRecipientName());
            order.setType(OrderType.NORMAL);

            BigDecimal subtotal = BigDecimal.ZERO;
            BigDecimal shippingFee = shippingMap.getOrDefault(sellerId, BigDecimal.ZERO);

            order.setShippingFee(shippingFee);

            List<OrderItem> orderItems = new ArrayList<>();

            for (CartItem ci : items) {

                Product p = ci.getProduct();

                BigDecimal unitPrice = p.getPrice();
                BigDecimal itemSubtotal =
                        unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity()));

                OrderItem oi = new OrderItem();
                oi.setOrder(order);
                oi.setProduct(p);
                oi.setQuantity(ci.getQuantity());
                oi.setUnitPrice(unitPrice);
                oi.setSubtotal(itemSubtotal);
                oi.setCreatedAt(LocalDateTime.now());

                orderItems.add(oi);

                subtotal = subtotal.add(itemSubtotal);
            }
            order.setCode(generateOrderCode(buyer.getId()));
            order.setItems(orderItems);
            order.setSubtotal(subtotal);
            BigDecimal finalPrice = subtotal.add(shippingFee);

            order.setFinalPrice(finalPrice);
            order.setTotalAmount(subtotal);

            orderRepo.save(order);

            totalAmount = totalAmount.add(subtotal);
            orders.add(order);
        }

        if ("COD".equals(req.getPaymentMethod())) {
            for (Order o : orders) {
                o.setStatus(OrderStatus.PROCESSING);
            }

            orderRepo.saveAll(orders);
            cartRepo.deleteAll(cartItems);

            return buildResponse(null, totalAmount, null, "SUCCESS");
        }
        if ("VNPAY".equals(req.getPaymentMethod())) {

            PaymentSession session = paymentSessionService.createSession(buyer, orders, req.getBankCode());
            for (Order o : orders) {
                o.setStatus(OrderStatus.AWAITING_PAYMENT);
            }

            orderRepo.saveAll(orders);
            cartRepo.deleteAll(cartItems);

            return buildResponse(
                    session.getId(),
                    totalAmount,
                    session.getPaymentUrl(),
                    "PENDING_PAYMENT"
            );
        }
        return buildResponse(null, totalAmount, null, "SUCCESS");
    }

    private CheckoutResponse buildResponse(
            Long paymentId,
            BigDecimal total,
            String paymentUrl,
            String status
    ) {

        return new CheckoutResponse(
                paymentId,
                "CHK-" + System.currentTimeMillis(),
                total,
                paymentUrl,
                status
        );
    }
    public String generateOrderCode(Long userId) {
        String time = DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
                .format(LocalDateTime.now());

        int random = ThreadLocalRandom.current().nextInt(100, 999);

        return "ORD-" + userId + "-" + time + "-" + random;
    }
}
