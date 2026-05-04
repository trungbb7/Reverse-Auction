package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.ComplaintResponse;
import vn.edu.hcmuaf.reverseauction.dto.CreateComplaintResponse;
import vn.edu.hcmuaf.reverseauction.dto.CreateComplaintRequest;
import vn.edu.hcmuaf.reverseauction.dto.RespondComplaintRequest;
import vn.edu.hcmuaf.reverseauction.dto.RespondComplaintResponse;
import vn.edu.hcmuaf.reverseauction.dto.ResolveComplaintRequest;
import vn.edu.hcmuaf.reverseauction.dto.ResolveComplaintResponse;
import vn.edu.hcmuaf.reverseauction.entity.Complaint;
import vn.edu.hcmuaf.reverseauction.repository.ComplaintRepository;
import vn.edu.hcmuaf.reverseauction.repository.OrderRepository;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ComplaintService {
    private final ComplaintRepository complaintRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public CreateComplaintResponse createComplaint(CreateComplaintRequest request) {
        var order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + request.orderId()));

        Complaint complaint = new Complaint();
        complaint.setOrder(order);
        complaint.setReason(request.reason());
        complaint.setEvidenceUrls(request.evidenceUrls() == null ? List.of() : List.copyOf(request.evidenceUrls()));
        complaint.setStatus("PENDING_SELLER");
        complaint.setCreatedAt(Instant.now());
        complaint.setUpdatedAt(complaint.getCreatedAt());
        complaint = complaintRepository.save(complaint);

        return new CreateComplaintResponse(complaint.getId(), complaint.getOrder().getId(), complaint.getStatus(), complaint.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> listComplaints() {
        return complaintRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toComplaintSummary)
                .toList();
    }

    @Transactional
    public RespondComplaintResponse respondComplaint(Long complaintId, RespondComplaintRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintId));
        complaint.setSellerAction(normalizeToken(request.action()));
        complaint.setSellerMessage(request.sellerMessage());
        complaint.setSellerEvidence(request.sellerEvidence());
        complaint.setStatus("PENDING_ADMIN");
        complaint.setUpdatedAt(Instant.now());
        complaint = complaintRepository.save(complaint);

        return new RespondComplaintResponse(
                complaint.getId(),
                complaint.getStatus(),
                complaint.getSellerAction(),
                complaint.getSellerMessage(),
                complaint.getSellerEvidence(),
                complaint.getUpdatedAt()
        );
    }

    @Transactional
    public ResolveComplaintResponse resolveComplaint(Long complaintId, ResolveComplaintRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintId));
        complaint.setVerdict(normalizeToken(request.verdict()));
        complaint.setAdminNote(request.adminNote());
        complaint.setStatus("CLOSED");
        complaint.setFinalAction(translateVerdict(complaint.getVerdict()));
        complaint.setResolvedAt(Instant.now());
        complaint.setUpdatedAt(complaint.getResolvedAt());
        complaint = complaintRepository.save(complaint);

        return new ResolveComplaintResponse(complaint.getId(), complaint.getStatus(), complaint.getFinalAction(), complaint.getResolvedAt());
    }

    private ComplaintResponse toComplaintSummary(Complaint complaint) {
        return new ComplaintResponse(
                complaint.getId(),
                complaint.getOrder().getId(),
                complaint.getReason(),
                complaint.getEvidenceUrls(),
                complaint.getStatus(),
                complaint.getSellerAction(),
                complaint.getSellerMessage(),
                complaint.getSellerEvidence(),
                complaint.getVerdict(),
                complaint.getAdminNote(),
                complaint.getFinalAction(),
                complaint.getCreatedAt(),
                complaint.getUpdatedAt(),
                complaint.getResolvedAt()
        );
    }

    private String normalizeToken(String raw) {
        if (raw == null || raw.isBlank()) {
            return "UNKNOWN";
        }
        return raw.trim().toUpperCase(Locale.ROOT).replace(' ', '_');
    }

    private String translateVerdict(String verdict) {
        return switch (verdict) {
            case "REFUND_TO_BUYER" -> "Hoan tien cho nguoi mua";
            case "REQUEST_REPLACEMENT" -> "Yeu cau doi san pham";
            case "REJECT_COMPLAINT" -> "Tu choi khieu nai";
            default -> "Da ghi nhan phan quyet";
        };
    }
}
