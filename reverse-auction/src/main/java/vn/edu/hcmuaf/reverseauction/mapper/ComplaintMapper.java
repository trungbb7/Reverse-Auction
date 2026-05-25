package vn.edu.hcmuaf.reverseauction.mapper;

import org.springframework.stereotype.Component;
import vn.edu.hcmuaf.reverseauction.dto.ComplaintResponse;
import vn.edu.hcmuaf.reverseauction.dto.CreateComplaintResponse;
import vn.edu.hcmuaf.reverseauction.entity.Complaint;

import java.util.ArrayList;
import java.util.List;

@Component
public class ComplaintMapper {

    public ComplaintResponse toResponse(Complaint complaint) {
        if (complaint == null) {
            return null;
        }

        return new ComplaintResponse(
                complaint.getId(),
                complaint.getBuyer() == null ? null : complaint.getBuyer().getId(),
                complaint.getBuyer() == null ? null : complaint.getBuyer().getFullName(),
                complaint.getOrder() == null ? null : complaint.getOrder().getId(),
                complaint.getOrder() == null ? null : complaint.getOrder().getCode(),
                complaint.getChatRoom() == null ? null : complaint.getChatRoom().getId(),
                complaint.getContent(),
                safeList(complaint.getAttachmentUrls()),
                complaint.getStatus(),
                complaint.getCreatedAt(),
                complaint.getUpdatedAt(),
                complaint.getResolvedAt()
        );
    }

    public CreateComplaintResponse toCreateResponse(Complaint complaint) {
        if (complaint == null) {
            return null;
        }

        return new CreateComplaintResponse(
                complaint.getId(),
                complaint.getChatRoom() == null ? null : complaint.getChatRoom().getId(),
                complaint.getStatus() == null ? null : complaint.getStatus().name(),
                complaint.getCreatedAt()
        );
    }

    private List<String> safeList(List<String> values) {
        if (values == null) {
            return List.of();
        }
        return new ArrayList<>(values);
    }
}
