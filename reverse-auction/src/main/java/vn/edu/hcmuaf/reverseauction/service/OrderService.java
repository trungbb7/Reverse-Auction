package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.dto.OrderResponseDTO;
import vn.edu.hcmuaf.reverseauction.entity.OrderStatus;
import java.util.List;

public interface OrderService {
    List<OrderResponseDTO> getOrdersByUserId(Long uid);
    List<OrderResponseDTO> getOrdersBySellerId(Long sellerId);
    List<OrderResponseDTO> getAllOrders();
    OrderResponseDTO getOrderById(Long id);
    OrderResponseDTO updateStatus(Long id, OrderStatus status);
    OrderResponseDTO updateShipping(Long orderId, String address, String phone);
    OrderResponseDTO payWithBalance(Long orderId);
}
