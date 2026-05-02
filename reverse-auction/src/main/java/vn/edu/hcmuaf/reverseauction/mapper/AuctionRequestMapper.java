package vn.edu.hcmuaf.reverseauction.mapper;


import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.data.domain.Page;
import vn.edu.hcmuaf.reverseauction.dto.AuctionRequestResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.PageResponse;
import vn.edu.hcmuaf.reverseauction.entity.AuctionRequest;
import vn.edu.hcmuaf.reverseauction.entity.Bid;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface AuctionRequestMapper {
    @Mapping(target = "buyerId", expression = "java(aucRe.getBuyer().getId())")
    @Mapping(target = "buyerName", expression = "java(aucRe.getBuyer().getFullName())")
    @Mapping(target = "categoryId", expression = "java(aucRe.getCategory().getId())")
    @Mapping(target = "categoryName", expression = "java(aucRe.getCategory().getName())")
    @Mapping(target = "lowestPrice", source = "aucRe", qualifiedByName = "calculateLowestBidPrice")
    @Mapping(target = "totalBids", source = "aucRe", qualifiedByName = "calculateTotalBids")
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


    @Named("calculateLowestBidPrice")
    default BigDecimal calculateLowestBidPrice(AuctionRequest aucRe) {
        if(aucRe.getBids() == null || aucRe.getBids().isEmpty()) {
            return null;
        }
        return aucRe.getBids().stream()
                .map(Bid::getBidPrice)
                .filter(Objects::nonNull)
                .min(BigDecimal::compareTo)
                .orElse(null);
    }

    @Named("calculateTotalBids")
    default int calculateTotalBids(AuctionRequest aucRe) {
        if(aucRe.getBids() == null || aucRe.getBids().isEmpty()) {
            return 0;
        }
        return aucRe.getBids().size();
    }
}
