package vn.edu.hcmuaf.reverseauction.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;
import vn.edu.hcmuaf.reverseauction.dto.BidResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.PageResponse;
import vn.edu.hcmuaf.reverseauction.entity.Bid;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface BidMapper {
    @Mapping(target = "auctionId", expression = "java(bid.getAuction().getId())")
    @Mapping(target = "sellerId", expression = "java(bid.getSeller().getId())")
    @Mapping(target = "sellerName", expression = "java(bid.getSeller().getFullName())")
    BidResponseDTO toDTO(Bid bid);

    default PageResponse<BidResponseDTO> toPageResponse(Page<Bid> page) {
        List<BidResponseDTO> content = page.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.<BidResponseDTO>builder()
                .content(content)
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
