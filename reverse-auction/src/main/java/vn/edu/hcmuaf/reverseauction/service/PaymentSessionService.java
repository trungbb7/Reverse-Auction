package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.entity.Order;
import vn.edu.hcmuaf.reverseauction.entity.PaymentSession;
import vn.edu.hcmuaf.reverseauction.entity.User;

import java.util.List;

public interface PaymentSessionService {
    PaymentSession createSession(User buyer, List<Order> orders, String bankCode);
    void handleCallback(String sessionCode, String status);
}
