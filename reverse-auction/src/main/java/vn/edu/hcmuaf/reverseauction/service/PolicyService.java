package vn.edu.hcmuaf.reverseauction.service;

import vn.edu.hcmuaf.reverseauction.dto.PolicyDTO;
import java.util.List;

public interface PolicyService {
    List<PolicyDTO> getAllPolicies();
    PolicyDTO getPolicyById(Long id);
    PolicyDTO getPolicyByType(String type);
    PolicyDTO createPolicy(PolicyDTO policyDTO);
    PolicyDTO updatePolicy(Long id, PolicyDTO policyDTO);
    void deletePolicy(Long id);
}
