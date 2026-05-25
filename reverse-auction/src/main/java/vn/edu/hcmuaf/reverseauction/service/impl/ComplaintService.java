package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.hcmuaf.reverseauction.dto.ComplaintResponse;
import vn.edu.hcmuaf.reverseauction.dto.ComplaintStatusUpdateRequest;
import vn.edu.hcmuaf.reverseauction.dto.CreateComplaintRequest;
import vn.edu.hcmuaf.reverseauction.dto.CreateComplaintResponse;
import vn.edu.hcmuaf.reverseauction.entity.Complaint;
import vn.edu.hcmuaf.reverseauction.entity.ComplaintStatus;
import vn.edu.hcmuaf.reverseauction.entity.ExternalConversation;
import vn.edu.hcmuaf.reverseauction.entity.Order;
import vn.edu.hcmuaf.reverseauction.entity.Role;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.mapper.ComplaintMapper;
import vn.edu.hcmuaf.reverseauction.repository.ComplaintRepository;
import vn.edu.hcmuaf.reverseauction.repository.ExternalConversationRepository;
import vn.edu.hcmuaf.reverseauction.repository.OrderRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplaintService {
    private final ComplaintRepository complaintRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ExternalConversationRepository conversationRepository;
    private final ComplaintMapper complaintMapper;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Transactional
    public CreateComplaintResponse createComplaint(Authentication authentication, CreateComplaintRequest request, List<MultipartFile> attachments) {
        User buyer = resolveCurrentBuyer(authentication);
        String content = normalizeContent(request.content());
        Order order = resolveOrderForBuyer(request.orderId(), buyer);
        User admin = resolveAdmin();
        ExternalConversation chatRoom = createComplaintChatRoom(buyer, admin);

        Instant now = Instant.now();
        Complaint complaint = Complaint.builder()
                .buyer(buyer)
                .order(order)
                .content(content)
                .chatRoom(chatRoom)
                .status(ComplaintStatus.PENDING)
                .createdAt(now)
                .updatedAt(now)
                .build();

        complaint = complaintRepository.save(complaint);

        List<String> attachmentUrls = storeAttachments(complaint.getId(), attachments);
        if (!attachmentUrls.isEmpty()) {
            complaint.setAttachmentUrls(attachmentUrls);
            complaint.setUpdatedAt(Instant.now());
            complaint = complaintRepository.save(complaint);
        }

        return complaintMapper.toCreateResponse(complaint);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> listMyComplaints(Authentication authentication) {
        User buyer = resolveCurrentBuyer(authentication);
        return complaintRepository.findAllByBuyer_IdOrderByCreatedAtDesc(buyer.getId())
                .stream()
                .map(complaintMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getMyComplaint(Authentication authentication, Long complaintId) {
        User buyer = resolveCurrentBuyer(authentication);
        Complaint complaint = complaintRepository.findByIdAndBuyer_Id(complaintId, buyer.getId())
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintId));
        return complaintMapper.toResponse(complaint);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> listAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(complaintMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaint(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintId));
        return complaintMapper.toResponse(complaint);
    }

    @Transactional
    public ComplaintResponse updateComplaintStatus(Long complaintId, ComplaintStatusUpdateRequest request) {
        if (request == null || request.status() == null) {
            throw new IllegalArgumentException("Complaint status is required");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintId));

        complaint.setStatus(request.status());
        complaint.setUpdatedAt(Instant.now());
        if (request.status() == ComplaintStatus.RESOLVED && complaint.getResolvedAt() == null) {
            complaint.setResolvedAt(complaint.getUpdatedAt());
        }
        complaint = complaintRepository.save(complaint);

        return complaintMapper.toResponse(complaint);
    }

    private User resolveCurrentBuyer(Authentication authentication) {
        User user = resolveCurrentUser(authentication);
        if (!Role.ROLE_BUYER.equals(user.getRole())) {
            throw new IllegalArgumentException("Only buyer can create or view complaints");
        }
        return user;
    }

    private User resolveCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalArgumentException("Authenticated user is required");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    private User resolveAdmin() {
        return userRepository.findFirstByRoleOrderByIdAsc(Role.ROLE_ADMIN)
                .orElseThrow(() -> new IllegalArgumentException("Admin account not found"));
    }

    private Order resolveOrderForBuyer(Long orderId, User buyer) {
        if (orderId == null) {
            return null;
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        if (order.getBuyer() == null || !order.getBuyer().getId().equals(buyer.getId())) {
            throw new IllegalArgumentException("Order does not belong to buyer");
        }
        return order;
    }

    private ExternalConversation createComplaintChatRoom(User buyer, User admin) {
        long nextId = conversationRepository.findMaxId() + 1;
        Instant now = Instant.now();
        ExternalConversation conversation = ExternalConversation.builder()
                .id(nextId)
                .participantsHash("complaint-" + UUID.randomUUID())
                .user1(buyer.getId() <= admin.getId() ? buyer : admin)
                .user2(buyer.getId() <= admin.getId() ? admin : buyer)
                .createdDate(now)
                .updatedDate(now)
                .complaintChat(true)
                .build();
        return conversationRepository.save(conversation);
    }

    private String normalizeContent(String rawContent) {
        if (rawContent == null || rawContent.isBlank()) {
            throw new IllegalArgumentException("Complaint content is required");
        }
        return rawContent.trim();
    }

    private List<String> storeAttachments(Long complaintId, List<MultipartFile> attachments) {
        if (attachments == null || attachments.isEmpty()) {
            return List.of();
        }

        List<String> urls = new ArrayList<>();
        Path complaintDir = Paths.get(uploadDir, "complaints", String.valueOf(complaintId));

        try {
            Files.createDirectories(complaintDir);
        } catch (IOException e) {
            throw new IllegalArgumentException("Cannot create upload directory", e);
        }

        for (MultipartFile file : attachments) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            String contentType = file.getContentType();
            if (contentType != null && !contentType.toLowerCase(Locale.ROOT).startsWith("image/")
                    && !contentType.toLowerCase(Locale.ROOT).startsWith("video/")) {
                throw new IllegalArgumentException("Only image/video files are allowed");
            }

            String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "attachment" : file.getOriginalFilename());
            String extension = StringUtils.getFilenameExtension(originalName);
            String storedName = UUID.randomUUID() + (extension == null ? "" : "." + extension);
            Path target = complaintDir.resolve(storedName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new IllegalArgumentException("Failed to store attachment: " + originalName, e);
            }

            urls.add("/uploads/complaints/" + complaintId + "/" + storedName);
        }

        return new ArrayList<>(urls);
    }
}
