package vn.edu.hcmuaf.reverseauction.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "external_conversation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExternalConversation {

    private Long id;

    private String participantsHash;

    private List<User> users;

    private Instant createdDate;

}
