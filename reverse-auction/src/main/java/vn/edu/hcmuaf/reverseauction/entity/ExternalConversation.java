package vn.edu.hcmuaf.reverseauction.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "external_conversation")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalConversation {

    @Id
    private Long id;

    @Column(name = "participants_hash", nullable = false, unique = true)
    private String participantsHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @Column(nullable = false)
    private Instant createdDate;

    @Column(nullable = false)
    private Instant updatedDate;

    @Column(nullable = false)
    @Builder.Default
    private boolean complaintChat = false;
}
