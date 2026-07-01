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
import vn.edu.hcmuaf.reverseauction.dto.response.FileResponse;
import vn.edu.hcmuaf.reverseauction.entity.*;
import vn.edu.hcmuaf.reverseauction.repository.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ComplaintService {
    private final ComplaintRepository complaintRepository;
    private final OrderRepository orderRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final FileService fileService;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public CreateComplaintResponse createComplaint(CreateComplaintRequest request) {
        return createComplaint(request.orderId(), request.reason(), request.evidenceUrls());
    }

    @Transactional
    public CreateComplaintResponse createComplaint(Long orderId, String reason, MultipartFile[] evidenceImages) {
        List<String> evidenceUrls = evidenceImages == null || evidenceImages.length == 0
                ? List.of()
                : fileService.uploadMultipleFiles(evidenceImages).stream()
                .map(FileResponse::getUrl)
                .toList();

        return createComplaint(orderId, reason, evidenceUrls);
    }

    @Transactional
    public CreateComplaintResponse createComplaint(Long orderId, String reason, List<String> evidenceUrls) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        order.setStatus(OrderStatus.DISPUTED);

        Complaint complaint = new Complaint();
        complaint.setOrder(order);
        complaint.setBuyer(order.getBuyer());
        complaint.setReason(reason);
        complaint.setEvidenceUrls(evidenceUrls == null ? List.of() : List.copyOf(evidenceUrls));
        complaint.setStatus(ComplaintStatus.PENDING_SELLER);
        complaint.setCreatedAt(Instant.now());
        complaint.setUpdatedAt(complaint.getCreatedAt());
        complaint = complaintRepository.save(complaint);

        orderRepository.save((order));

        return new CreateComplaintResponse(complaint.getId(), complaint.getOrder().getId(), complaint.getStatus(), complaint.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> listComplaints() {
            return complaintRepository.findAll(Sort.by(Sort.Direction.DESC, "id"))
                    .stream()
                    .map(this::toComplaintSummary)
                    .toList();
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> listByBuyer(Long buyerId) {
        return complaintRepository.findByBuyerId(buyerId)
                .stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .map(this::toComplaintSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> listBySeller(Long sellerId) {
        return complaintRepository.findByOrderSellerId(sellerId)
                .stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
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
        complaint.setStatus(ComplaintStatus.PENDING_ADMIN);
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
        try{
            Complaint complaint = complaintRepository.findById(complaintId)
                    .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintId));

            Verdict verdict = Verdict.valueOf(request.verdict());

            Order order = complaint.getOrder();

            if (verdict == Verdict.REJECT_COMPLAINT) {
                order.setStatus(OrderStatus.COMPLETED);
                User seller = order.getSeller();
                BigDecimal commRate = systemSettingRepository.findById("COMMISSION_RATE")
                        .map(s -> {
                            try {
                                return new BigDecimal(s.getValue());
                            } catch (Exception e) {
                                return BigDecimal.valueOf(10);
                            }
                        })
                        .orElse(BigDecimal.valueOf(10));
                BigDecimal totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
                BigDecimal commAmount = totalAmount.multiply(commRate).divide(BigDecimal.valueOf(100));
                BigDecimal sellerEarnings = totalAmount.subtract(commAmount);

                order.setCommissionRate(commRate);
                order.setCommissionAmount(commAmount);

                if (seller.getBalance() == null){
                    seller.setBalance(BigDecimal.ZERO);
                }

                seller.setBalance(seller.getBalance().add(sellerEarnings));
                userRepository.save(seller);

                Transaction transaction = Transaction.builder()
                        .user(seller)
                        .amount(sellerEarnings)
                        .type(TransactionType.PAYMENT)
                        .status(TransactionStatus.SUCCESS)
                        .code("EARN_" + order.getCode())
                        .description("Thu nhập bán hàng từ đơn hàng " + order.getCode())
                        .createdAt(LocalDateTime.now())
                        .build();
                transactionRepository.save(transaction);


            } else if (verdict == Verdict.REFUND_TO_BUYER) {
                order.setStatus(OrderStatus.REFUND);
                User buyer = order.getBuyer();
                if(buyer.getBalance() == null){
                    buyer.setBalance(BigDecimal.ZERO);
                }
                BigDecimal amount = order.getSubtotal() != null ? order.getSubtotal() : BigDecimal.ZERO;
                buyer.setBalance(buyer.getBalance().add(amount));

                userRepository.save(buyer);

                Transaction transaction = Transaction.builder()
                        .user(buyer)
                        .amount(amount)
                        .type(TransactionType.REFUND)
                        .status(TransactionStatus.SUCCESS)
                        .code("REFUND_" + order.getCode())
                        .description("Hoàn tiền cho người mua" + order.getCode())
                        .createdAt(LocalDateTime.now())
                        .build();
                transactionRepository.save(transaction);
            }

            complaint.setVerdict(verdict);
            complaint.setAdminNote(request.adminNote());
            complaint.setStatus(ComplaintStatus.SOLVED);
            complaint.setFinalAction(translateVerdict(verdict.toString()));
            complaint.setResolvedAt(Instant.now());
            complaint.setUpdatedAt(complaint.getResolvedAt());
            complaint = complaintRepository.save(complaint);

            orderRepository.save(order);

            return new ResolveComplaintResponse(complaint.getId(), complaint.getStatus().toString(), complaint.getFinalAction(), complaint.getResolvedAt());
        }catch (Exception e){
            e.printStackTrace();
        }
        return null;
    }

    private ComplaintResponse toComplaintSummary(Complaint complaint) {

            String productName = "";
            if (complaint.getOrder().getProduct() != null) {
                productName = complaint.getOrder().getProduct().getName();
            }

            return new ComplaintResponse(
                    complaint.getId(),
                    complaint.getOrder().getId(),
                    complaint.getOrder().getCode(),
                    productName,
                    complaint.getBuyer().getId(),
                    complaint.getBuyer().getFullName(),
                    complaint.getOrder().getSeller().getId(),
                    complaint.getOrder().getSeller().getFullName(),
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
            case "REFUND_TO_BUYER" -> "Hoàn tiền cho người mua";
            case "REJECT_COMPLAINT" -> "Từ chối khiếu nại";
            default -> "Đã ghi nhận phán quyết";
        };
    }
}