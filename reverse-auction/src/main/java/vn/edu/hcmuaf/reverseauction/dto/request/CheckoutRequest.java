package vn.edu.hcmuaf.reverseauction.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CheckoutRequest {
    private String recipientName;
    private String phone;
    private String address;
    private String note;

    private String paymentMethod;

    private List<Long> selectedCartItemIds;
    private List<ShopShipping> shops;
    private String bankCode;

    @Data
    public static class ShopShipping {
        private Long shopId;
        private java.math.BigDecimal shippingFee;
    }
}
