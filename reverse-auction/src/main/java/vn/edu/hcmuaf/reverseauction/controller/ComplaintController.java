package vn.edu.hcmuaf.reverseauction.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmuaf.reverseauction.dto.ComplaintResponse;
import vn.edu.hcmuaf.reverseauction.dto.CreateComplaintResponse;
import vn.edu.hcmuaf.reverseauction.dto.CreateComplaintRequest;
import vn.edu.hcmuaf.reverseauction.dto.RespondComplaintRequest;
import vn.edu.hcmuaf.reverseauction.dto.RespondComplaintResponse;
import vn.edu.hcmuaf.reverseauction.dto.ResolveComplaintRequest;
import vn.edu.hcmuaf.reverseauction.dto.ResolveComplaintResponse;
import vn.edu.hcmuaf.reverseauction.service.impl.ComplaintService;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Complaint")
@RequiredArgsConstructor
public class ComplaintController {
    private final ComplaintService complaintService;

    @PostMapping("/complaints")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<CreateComplaintResponse> createComplaint(@RequestBody CreateComplaintRequest request) {
        return ResponseEntity.ok(complaintService.createComplaint(request));
    }

    @PostMapping(value = "/complaints", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<CreateComplaintResponse> createComplaintWithImages(
            @RequestParam Long orderId,
            @RequestParam String reason,
            @RequestPart(value = "evidenceImages", required = false) MultipartFile[] evidenceImages
    ) {
        return ResponseEntity.ok(complaintService.createComplaint(orderId, reason, evidenceImages));
    }

    @GetMapping("/complaints")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<List<ComplaintResponse>> listComplaints() {
        return ResponseEntity.ok(complaintService.listComplaints());
    }

    @PatchMapping("/complaints/{id}/respond")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<RespondComplaintResponse> respondComplaint(@PathVariable Long id, @RequestBody RespondComplaintRequest request) {
        return ResponseEntity.ok(complaintService.respondComplaint(id, request));
    }

    @PatchMapping("/admin/complaints/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResolveComplaintResponse> resolveComplaint(@PathVariable Long id, @RequestBody ResolveComplaintRequest request) {
        return ResponseEntity.ok(complaintService.resolveComplaint(id, request));
    }
}
