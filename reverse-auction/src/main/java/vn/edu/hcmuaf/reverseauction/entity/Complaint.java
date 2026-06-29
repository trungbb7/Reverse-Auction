package vn.edu.hcmuaf.reverseauction.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import vn.edu.hcmuaf.reverseauction.entity.Order;
import vn.edu.hcmuaf.reverseauction.entity.User;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @Column(length = 2000)
    private String reason;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "complaint_evidence_urls", joinColumns = @JoinColumn(name = "complaint_id"))
    @Column(name = "evidence_url")
    private List<String> evidenceUrls = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status;
    @Column(length = 100)
    private String sellerAction;
    @Column(length = 2000)
    private String sellerMessage;
    @Column(length = 2000)
    private String sellerEvidence;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private Verdict verdict;
    @Column(length = 2000)
    private String adminNote;
    @Column(length = 2000)
    private String finalAction;
    @Column(nullable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant updatedAt;
    private Instant resolvedAt;
}
