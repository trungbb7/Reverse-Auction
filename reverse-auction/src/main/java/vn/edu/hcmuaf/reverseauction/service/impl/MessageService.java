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

        Message message = new Message();
        message.setReceiver(receiver);
        message.setAuction(auction);
        message.setSender(sender);
        message.setSenderName(sender.getEmail());
        message.setContent(request.content());
        message.setTime(Instant.now());
        message = messageRepository.save(message);

        return new MessageResponse(message.getId(), message.getReceiver().getId(), message.getAuction().getId(), message.getContent(), message.getTime());
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> listMessages(Long auctionId) {
        List<Message> messages = auctionId == null
                ? messageRepository.findAll(Sort.by(Sort.Direction.ASC, "time"))
                : messageRepository.findAllByAuction_IdOrderByTimeAsc(auctionId);

        return messages.stream()
                .map(message -> new MessageResponse(message.getId(), message.getReceiver().getId(), message.getAuction().getId(), message.getContent(), message.getTime()))
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
