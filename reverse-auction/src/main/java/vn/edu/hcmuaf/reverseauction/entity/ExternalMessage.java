package vn.edu.hcmuaf.reverseauction.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "external_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExternalMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String conversationId;

    private String message;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    private Instant createdDate;
}
