package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.reverseauction.dto.AdminStatsResponse;
import vn.edu.hcmuaf.reverseauction.dto.SellerStatsResponse;
import vn.edu.hcmuaf.reverseauction.entity.Order;
import vn.edu.hcmuaf.reverseauction.entity.OrderStatus;
import vn.edu.hcmuaf.reverseauction.repository.AuctionRequestRepository;
import vn.edu.hcmuaf.reverseauction.repository.BidRepository;
import vn.edu.hcmuaf.reverseauction.repository.OrderRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.service.StatsService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final AuctionRequestRepository auctionRequestRepository;
    private final BidRepository bidRepository;

    @Override
    public AdminStatsResponse getAdminStats() {
        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();
        long totalAuctions = auctionRequestRepository.count();

        List<Order> completedOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .toList();

        BigDecimal totalRevenue = completedOrders.stream()
                .map(o -> {
                    if (o.getCommissionAmount() != null) {
                        return o.getCommissionAmount();
                    }
                    BigDecimal total = o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO;
                    return total.multiply(BigDecimal.valueOf(10)).divide(BigDecimal.valueOf(100));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> revenueByDay = completedOrders.stream()
                .filter(o -> o.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        o -> {
                            var date = o.getCreatedAt();
                            return date.getYear() + "-" + String.format("%02d", date.getMonthValue()) + "-" + String.format("%02d", date.getDayOfMonth());
                        },
                        Collectors.reducing(BigDecimal.ZERO, o -> {
                            if (o.getCommissionAmount() != null) {
                                return o.getCommissionAmount();
                            }
                            BigDecimal total = o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO;
                            return total.multiply(BigDecimal.valueOf(10)).divide(BigDecimal.valueOf(100));
                        }, BigDecimal::add)
                ));

        Map<String, BigDecimal> revenueByMonth = completedOrders.stream()
                .filter(o -> o.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        o -> {
                            var date = o.getCreatedAt();
                            return date.getYear() + "-" + String.format("%02d", date.getMonthValue());
                        },
                        Collectors.reducing(BigDecimal.ZERO, o -> {
                            if (o.getCommissionAmount() != null) {
                                return o.getCommissionAmount();
                            }
                            BigDecimal total = o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO;
                            return total.multiply(BigDecimal.valueOf(10)).divide(BigDecimal.valueOf(100));
                        }, BigDecimal::add)
                ));

        Map<String, BigDecimal> revenueByYear = completedOrders.stream()
                .filter(o -> o.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        o -> {
                            var date = o.getCreatedAt();
                            return String.valueOf(date.getYear());
                        },
                        Collectors.reducing(BigDecimal.ZERO, o -> {
                            if (o.getCommissionAmount() != null) {
                                return o.getCommissionAmount();
                            }
                            BigDecimal total = o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO;
                            return total.multiply(BigDecimal.valueOf(10)).divide(BigDecimal.valueOf(100));
                        }, BigDecimal::add)
                ));

        Map<String, BigDecimal> revenueByCategory = completedOrders.stream()
                .collect(Collectors.groupingBy(
                        o -> {
                            if (o.getProduct() != null && o.getProduct().getCategory() != null) {
                                return o.getProduct().getCategory().getName();
                            } else if (o.getAuction() != null && o.getAuction().getCategory() != null) {
                                return o.getAuction().getCategory().getName();
                            }
                            return "Khác";
                        },
                        Collectors.reducing(BigDecimal.ZERO, o -> {
                            if (o.getCommissionAmount() != null) {
                                return o.getCommissionAmount();
                            }
                            BigDecimal total = o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO;
                            return total.multiply(BigDecimal.valueOf(10)).divide(BigDecimal.valueOf(100));
                        }, BigDecimal::add)
                ));

        Map<String, Long> ordersByStatus = orderRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        o -> o.getStatus().name(),
                        Collectors.counting()
                ));

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalOrders(totalOrders)
                .totalAuctions(totalAuctions)
                .totalRevenue(totalRevenue)
                .revenueByDay(revenueByDay)
                .revenueByMonth(revenueByMonth)
                .revenueByYear(revenueByYear)
                .revenueByCategory(revenueByCategory)
                .ordersByStatus(ordersByStatus)
                .build();
    }

    @Override
    public SellerStatsResponse getSellerStats(Long sellerId) {
        long totalBids = bidRepository.countBySellerId(sellerId);
        long totalWonBids = bidRepository.countBySellerIdAndIsWinner(sellerId, true);

        List<Order> sellerOrders = orderRepository.findBySeller_Id(sellerId);

        BigDecimal totalRevenue = sellerOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> ordersByStatus = sellerOrders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getStatus().name(),
                        Collectors.counting()
                ));

        Map<String, BigDecimal> revenueByDay = sellerOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED && o.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        o -> {
                            var date = o.getCreatedAt();
                            return date.getYear() + "-" + String.format("%02d", date.getMonthValue()) + "-" + String.format("%02d", date.getDayOfMonth());
                        },
                        Collectors.reducing(BigDecimal.ZERO, Order::getTotalAmount, BigDecimal::add)
                ));

        Map<String, BigDecimal> revenueByMonth = sellerOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED && o.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        o -> {
                            var date = o.getCreatedAt();
                            return date.getYear() + "-" + String.format("%02d", date.getMonthValue());
                        },
                        Collectors.reducing(BigDecimal.ZERO, Order::getTotalAmount, BigDecimal::add)
                ));

        Map<String, BigDecimal> revenueByYear = sellerOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED && o.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        o -> {
                            var date = o.getCreatedAt();
                            return String.valueOf(date.getYear());
                        },
                        Collectors.reducing(BigDecimal.ZERO, Order::getTotalAmount, BigDecimal::add)
                ));

        Map<String, Map<String, BigDecimal>> revenueByCategoryByMonth = sellerOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED && o.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        o -> {
                            var date = o.getCreatedAt();
                            return date.getYear() + "-" + String.format("%02d", date.getMonthValue());
                        },
                        Collectors.groupingBy(
                                o -> {
                                    if (o.getProduct() != null && o.getProduct().getCategory() != null) {
                                        return o.getProduct().getCategory().getName();
                                    } else if (o.getAuction() != null && o.getAuction().getCategory() != null) {
                                        return o.getAuction().getCategory().getName();
                                    }
                                    return "Khác";
                                },
                                Collectors.reducing(BigDecimal.ZERO, Order::getTotalAmount, BigDecimal::add)
                        )
                ));

        return SellerStatsResponse.builder()
                .totalBids(totalBids)
                .totalWonBids(totalWonBids)
                .totalOrders((long) sellerOrders.size())
                .totalRevenue(totalRevenue)
                .ordersByStatus(ordersByStatus)
                .revenueByDay(revenueByDay)
                .revenueByMonth(revenueByMonth)
                .revenueByYear(revenueByYear)
                .revenueByCategoryByMonth(revenueByCategoryByMonth)
                .build();
    }
}
