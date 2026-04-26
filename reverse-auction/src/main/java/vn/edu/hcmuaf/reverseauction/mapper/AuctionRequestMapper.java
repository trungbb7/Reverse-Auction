package vn.edu.hcmuaf.reverseauction.mapper;


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;
import vn.edu.hcmuaf.reverseauction.dto.AuctionRequestResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.PageResponse;
import vn.edu.hcmuaf.reverseauction.entity.AuctionRequest;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface AuctionRequestMapper {
    @Mapping(target = "buyerId", expression = "java(aucRe.getBuyer().getId())")
    @Mapping(target = "buyerName", expression = "java(aucRe.getBuyer().getFullName())")
    @Mapping(target = "categoryId", expression = "java(aucRe.getCategory().getId())")
    @Mapping(target = "categoryName", expression = "java(aucRe.getCategory().getName())")
    AuctionRequestResponseDTO toDTO(AuctionRequest aucRe);

    default PageResponse<AuctionRequestResponseDTO> toPageResponse(Page<AuctionRequest> page) {
        List<AuctionRequestResponseDTO> content = page.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.<AuctionRequestResponseDTO>builder()
                .content(content)
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
