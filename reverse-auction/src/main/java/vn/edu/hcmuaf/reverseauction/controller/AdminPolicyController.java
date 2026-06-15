package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.hcmuaf.reverseauction.dto.PolicyDTO;
import vn.edu.hcmuaf.reverseauction.service.PolicyService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/policies")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPolicyController {

    private final PolicyService policyService;

    @GetMapping
    public ResponseEntity<List<PolicyDTO>> getAllPolicies() {
        return ResponseEntity.ok(policyService.getAllPolicies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PolicyDTO> getPolicyById(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.getPolicyById(id));
    }

    @PostMapping
    public ResponseEntity<PolicyDTO> createPolicy(@RequestBody PolicyDTO policyDTO) {
        return ResponseEntity.ok(policyService.createPolicy(policyDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PolicyDTO> updatePolicy(@PathVariable Long id, @RequestBody PolicyDTO policyDTO) {
        return ResponseEntity.ok(policyService.updatePolicy(id, policyDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.ok().build();
    }
}
