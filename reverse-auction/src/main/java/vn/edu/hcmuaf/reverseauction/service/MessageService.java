package vn.edu.hcmuaf.reverseauction.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.MessageResponse;
import vn.edu.hcmuaf.reverseauction.dto.CreateMessageRequest;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.entity.AuctionEntity;
import vn.edu.hcmuaf.reverseauction.entity.MessageEntity;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.repository.auction.AuctionRepository;
import vn.edu.hcmuaf.reverseauction.repository.message.MessageRepository;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;

    @Transactional
    public MessageResponse sendMessage(Authentication authentication, CreateMessageRequest request) {
        AuctionEntity auction = auctionRepository.findById(request.auctionId())
                .orElseThrow(() -> new IllegalArgumentException("Auction not found: " + request.auctionId()));
        User sender = resolveCurrentUser(authentication);

        MessageEntity message = new MessageEntity();
        message.setReceiverId(request.receiverId());
        message.setAuctionId(auction.getId());
        message.setSenderId(sender.getId());
        message.setSenderName(sender.getEmail());
        message.setContent(request.content());
        message.setTime(Instant.now());
        message = messageRepository.save(message);

        return new MessageResponse(message.getId(), message.getReceiverId(), message.getAuctionId(), message.getContent(), message.getTime());
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> listMessages(Long auctionId) {
        List<MessageEntity> messages = auctionId == null
                ? messageRepository.findAll(Sort.by(Sort.Direction.ASC, "time"))
                : messageRepository.findAllByAuctionIdOrderByTimeAsc(auctionId);

        return messages.stream()
                .map(message -> new MessageResponse(message.getId(), message.getReceiverId(), message.getAuctionId(), message.getContent(), message.getTime()))
                .toList();
    }

    private User resolveCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalArgumentException("Authenticated user is required");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }
}
