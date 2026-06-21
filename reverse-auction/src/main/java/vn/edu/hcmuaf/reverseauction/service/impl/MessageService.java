package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.MessageResponse;
import vn.edu.hcmuaf.reverseauction.dto.CreateMessageRequest;
import vn.edu.hcmuaf.reverseauction.entity.AuctionRequest;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.entity.Message;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.repository.AuctionRepository;
import vn.edu.hcmuaf.reverseauction.repository.MessageRepository;

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
        AuctionRequest auction = auctionRepository.findById(request.auctionId())
                .orElseThrow(() -> new IllegalArgumentException("Auction not found: " + request.auctionId()));
        User receiver = userRepository.findById(request.receiverId())
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found: " + request.receiverId()));
        User sender = resolveCurrentUser(authentication);

        // Basic security check: one of them must be the buyer
        Long buyerId = auction.getBuyer().getId();
        if (!sender.getId().equals(buyerId) && !receiver.getId().equals(buyerId)) {
            throw new IllegalArgumentException("One participant must be the auction buyer");
        }

        Message message = new Message();
        message.setReceiver(receiver);
        message.setAuction(auction);
        message.setSender(sender);
        message.setSenderName(sender.getFullName() != null ? sender.getFullName() : sender.getEmail());
        message.setContent(request.content() != null ? request.content() : "");
        message.setType(request.type() != null ? request.type() : "text");
        message.setUrl(request.url());
        message.setTime(Instant.now());
        message = messageRepository.save(message);

        return mapToResponse(message);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> listMessages(Long auctionId) {
        List<Message> messages = auctionId == null
                ? messageRepository.findAll(Sort.by(Sort.Direction.ASC, "time"))
                : messageRepository.findAllByAuction_IdOrderByTimeAsc(auctionId);

        return messages.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> listConversation(Authentication authentication, Long auctionId, Long sellerId) {
        User currentUser = resolveCurrentUser(authentication);
        AuctionRequest auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new IllegalArgumentException("Auction not found"));
        
        Long buyerId = auction.getBuyer().getId();
        Long otherId;

        if (currentUser.getId().equals(buyerId)) {
            // Buyer is viewing chat with a seller
            otherId = sellerId;
        } else {
            // Seller is viewing chat with the buyer
            otherId = buyerId;
        }

        if (otherId == null) {
            throw new IllegalArgumentException("Participant ID is required");
        }

        return messageRepository.findConversation(auctionId, currentUser.getId(), otherId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private MessageResponse mapToResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getSender().getId(),
                message.getSenderName(),
                message.getReceiver().getId(),
                message.getAuction().getId(),
                message.getContent(),
                message.getType(),
                message.getUrl(),
                message.getTime()
        );
    }

    private User resolveCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalArgumentException("Authenticated user is required");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }
}
