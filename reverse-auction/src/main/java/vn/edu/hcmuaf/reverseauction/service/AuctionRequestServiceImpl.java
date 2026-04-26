package vn.edu.hcmuaf.reverseauction.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.reverseauction.dto.AuctionRequestCreateDTO;
import vn.edu.hcmuaf.reverseauction.dto.AuctionRequestResponseDTO;
import vn.edu.hcmuaf.reverseauction.dto.PageResponse;
import vn.edu.hcmuaf.reverseauction.entity.AuctionRequest;
import vn.edu.hcmuaf.reverseauction.entity.AuctionStatus;
import vn.edu.hcmuaf.reverseauction.entity.Category;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.exception.ResourceNotFoundException;
import vn.edu.hcmuaf.reverseauction.mapper.AuctionRequestMapper;
import vn.edu.hcmuaf.reverseauction.repository.AuctionRequestRepository;
import vn.edu.hcmuaf.reverseauction.repository.CategoryRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuctionRequestServiceImpl implements AuctionRequestService {

    private final AuctionRequestRepository auctionRequestRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AuctionRequestMapper auctionRequestMapper;

    @Override
    public AuctionRequestResponseDTO createAuctionRequest(AuctionRequestCreateDTO requestDTO, String email) {
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Category category = categoryRepository.findById(requestDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + requestDTO.getCategoryId()));

        AuctionRequest auctionRequest = AuctionRequest.builder()
                .buyer(buyer)
                .category(category)
                .title(requestDTO.getTitle())
                .description(requestDTO.getDescription())
                .quantity(requestDTO.getQuantity())
                .budgetMax(requestDTO.getBudgetMax())
                .endDate(requestDTO.getEndDate())
                .status(AuctionStatus.OPEN)
                .build();

        AuctionRequest savedAuctionRequest = auctionRequestRepository.save(auctionRequest);

        return auctionRequestMapper.toDTO(savedAuctionRequest);
    }

    @Override
    public PageResponse<AuctionRequestResponseDTO> getAllAuctionRequests(Pageable pageable) {
        Page<AuctionRequest> page = auctionRequestRepository.findAll(pageable);
        return auctionRequestMapper.toPageResponse(page);
    }

    @Override
    public PageResponse<AuctionRequestResponseDTO> getMyAuctionRequests(String email, Pageable pageable) {
        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Page<AuctionRequest> page = auctionRequestRepository.findByBuyer(buyer, pageable);
        return auctionRequestMapper.toPageResponse(page);
    }
}
