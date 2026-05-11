package vn.edu.hcmuaf.reverseauction.dto.request;

import lombok.Data;

@Data
public class ReviewRequest {

    private Long orderId;

    private Integer rating;

    private String comment;
}
