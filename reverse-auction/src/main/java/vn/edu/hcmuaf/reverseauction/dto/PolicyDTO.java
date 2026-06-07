package vn.edu.hcmuaf.reverseauction.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyDTO {
    private Long id;
    private String title;
    private String content;
    private String type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
