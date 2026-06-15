package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.PolicyDTO;
import vn.edu.hcmuaf.reverseauction.service.PolicyService;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    @GetMapping
    public ResponseEntity<List<PolicyDTO>> getAllPolicies() {
        return ResponseEntity.ok(policyService.getAllPolicies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PolicyDTO> getPolicyById(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.getPolicyById(id));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<PolicyDTO> getPolicyByType(@PathVariable String type) {
        return ResponseEntity.ok(policyService.getPolicyByType(type));
    }
}
