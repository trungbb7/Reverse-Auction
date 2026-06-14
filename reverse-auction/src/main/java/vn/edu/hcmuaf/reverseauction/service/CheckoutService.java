package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.dto.request.CheckoutRequest;
import vn.edu.hcmuaf.reverseauction.dto.response.CheckoutResponse;
import vn.edu.hcmuaf.reverseauction.entity.User;

public interface CheckoutService {
    CheckoutResponse checkout(CheckoutRequest ckr, User user);
}
