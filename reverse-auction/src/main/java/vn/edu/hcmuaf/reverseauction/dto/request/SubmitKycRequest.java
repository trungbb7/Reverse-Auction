package vn.edu.hcmuaf.reverseauction.dto.request;

import lombok.Data;

@Data
public class SubmitKycRequest {
    private String businessLicense;
    private String frontIdentity;
    private String backIdentity;
    private String identityNumber;
}
