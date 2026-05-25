package vn.edu.hcmuaf.reverseauction.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.hcmuaf.reverseauction.dto.ComplaintResponse;
import vn.edu.hcmuaf.reverseauction.dto.ComplaintStatusUpdateRequest;
import vn.edu.hcmuaf.reverseauction.dto.CreateComplaintRequest;
import vn.edu.hcmuaf.reverseauction.dto.CreateComplaintResponse;
import vn.edu.hcmuaf.reverseauction.service.impl.ComplaintService;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Complaint")
@RequiredArgsConstructor
public class ComplaintController {
    private final ComplaintService complaintService;

    @PostMapping(value = "/complaints", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<CreateComplaintResponse> createComplaint(
            Authentication authentication,
            @RequestParam(required = false) Long orderId,
            @RequestParam String content,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments
    ) {
        CreateComplaintRequest request = new CreateComplaintRequest(orderId, content);
        return ResponseEntity.ok(complaintService.createComplaint(authentication, request, attachments));
    }

    @GetMapping("/complaints/my")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<List<ComplaintResponse>> listMyComplaints(Authentication authentication) {
        return ResponseEntity.ok(complaintService.listMyComplaints(authentication));
    }

    @GetMapping("/complaints/{id}")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<ComplaintResponse> getMyComplaint(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(complaintService.getMyComplaint(authentication, id));
    }

    @GetMapping("/admin/complaints")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ComplaintResponse>> listAllComplaints() {
        return ResponseEntity.ok(complaintService.listAllComplaints());
    }

    @GetMapping("/admin/complaints/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplaintResponse> getComplaint(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaint(id));
    }

    @PutMapping("/admin/complaints/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody ComplaintStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(complaintService.updateComplaintStatus(id, request));
    }
}
