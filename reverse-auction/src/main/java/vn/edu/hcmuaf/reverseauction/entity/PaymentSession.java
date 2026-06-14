package vn.edu.hcmuaf.reverseauction.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payment_sessions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @Column(nullable = false)
    private BigDecimal amount;

    private String bankCode;

    @Column(length = 1000)
    private String paymentUrl;

    private Instant paidAt;

    @Column(nullable = false)
    private Instant createdAt;

    @ManyToMany
    @JoinTable(
            name = "payment_session_orders",
            joinColumns = @JoinColumn(name = "payment_session_id"),
            inverseJoinColumns = @JoinColumn(name = "order_id")
    )
    @Builder.Default
    private List<Order> orders = new ArrayList<>();
}