package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.reverseauction.dto.PolicyDTO;
import vn.edu.hcmuaf.reverseauction.entity.Policy;
import vn.edu.hcmuaf.reverseauction.exception.ResourceNotFoundException;
import vn.edu.hcmuaf.reverseauction.repository.PolicyRepository;
import vn.edu.hcmuaf.reverseauction.service.PolicyService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PolicyServiceImpl implements PolicyService {

    private final PolicyRepository policyRepository;

    @Override
    public List<PolicyDTO> getAllPolicies() {
        return policyRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PolicyDTO getPolicyById(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with id: " + id));
        return mapToDTO(policy);
    }

    @Override
    public PolicyDTO getPolicyByType(String type) {
        Policy policy = policyRepository.findByType(type)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with type: " + type));
        return mapToDTO(policy);
    }

    @Override
    public PolicyDTO createPolicy(PolicyDTO policyDTO) {
        Policy policy = mapToEntity(policyDTO);
        Policy savedPolicy = policyRepository.save(policy);
        return mapToDTO(savedPolicy);
    }

    @Override
    public PolicyDTO updatePolicy(Long id, PolicyDTO policyDTO) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with id: " + id));

        policy.setTitle(policyDTO.getTitle());
        policy.setContent(policyDTO.getContent());
        policy.setType(policyDTO.getType());

        Policy updatedPolicy = policyRepository.save(policy);
        return mapToDTO(updatedPolicy);
    }

    @Override
    public void deletePolicy(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with id: " + id));
        policyRepository.delete(policy);
    }

    private PolicyDTO mapToDTO(Policy policy) {
        return PolicyDTO.builder()
                .id(policy.getId())
                .title(policy.getTitle())
                .content(policy.getContent())
                .type(policy.getType())
                .createdAt(policy.getCreatedAt())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }

    private Policy mapToEntity(PolicyDTO policyDTO) {
        return Policy.builder()
                .title(policyDTO.getTitle())
                .content(policyDTO.getContent())
                .type(policyDTO.getType())
                .build();
    }
}
