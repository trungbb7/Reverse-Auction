package vn.edu.hcmuaf.reverseauction.dto.response;

import lombok.Data;
import vn.edu.hcmuaf.reverseauction.dto.SellerRatingDTO;

@Data
public class ReviewContextResponse {

    private Long orderId;

    private String productName;
    private String productImage;

    private SellerRatingDTO seller;

    private boolean canReview;
    private boolean alreadyReviewed;
}
