package vn.edu.hcmuaf.reverseauction.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;
import vn.edu.hcmuaf.reverseauction.dto.NotificationResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.response.PageResponse;
import vn.edu.hcmuaf.reverseauction.entity.Notification;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "userId", expression = "java(notification.getUser().getId())")
    NotificationResponseDTO toDTO(Notification notification);

    default PageResponse<NotificationResponseDTO> toPageResponse(Page<Notification> page) {
        List<NotificationResponseDTO> content = page.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.<NotificationResponseDTO>builder()
                .content(content)
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
