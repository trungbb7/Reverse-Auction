package vn.edu.hcmuaf.reverseauction.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

import vn.edu.hcmuaf.reverseauction.entity.Order;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(nullable = false)
    private Long amount;
    @Column(nullable = false)
    private String bankCode;
    @Column(nullable = false, length = 1000)
    private String paymentUrl;
    @Column(nullable = false)
    private Instant createdAt;
}
