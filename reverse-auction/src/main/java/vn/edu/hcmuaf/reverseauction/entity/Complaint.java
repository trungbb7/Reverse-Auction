package vn.edu.hcmuaf.reverseauction.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "content", nullable = false, length = 4000)
    private String content;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "complaint_attachment_urls", joinColumns = @JoinColumn(name = "complaint_id"))
    @Column(name = "attachment_url", nullable = false, length = 1000)
    @Builder.Default
    private List<String> attachmentUrls = new ArrayList<>();

    @Enumerated(jakarta.persistence.EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.PENDING;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false, unique = true)
    private ExternalConversation chatRoom;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    private Instant resolvedAt;
}
