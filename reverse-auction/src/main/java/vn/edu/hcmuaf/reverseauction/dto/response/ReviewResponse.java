package vn.edu.hcmuaf.reverseauction.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponse {
    private String id;
    private String name;
    private String content;
    private int rating;
    private LocalDateTime createdAt;
}
