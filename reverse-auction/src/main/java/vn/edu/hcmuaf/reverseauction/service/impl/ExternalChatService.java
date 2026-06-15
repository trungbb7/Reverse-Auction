package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.request.ExternalMessageRequest;
import vn.edu.hcmuaf.reverseauction.dto.response.ExternalConversationResponse;
import vn.edu.hcmuaf.reverseauction.dto.response.ExternalMessageResponse;
import vn.edu.hcmuaf.reverseauction.entity.ExternalConversation;
import vn.edu.hcmuaf.reverseauction.entity.ExternalMessage;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.repository.ExternalConversationRepository;
import vn.edu.hcmuaf.reverseauction.repository.ExternalMessageRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExternalChatService {
    private final ExternalConversationRepository conversationRepository;
    private final ExternalMessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ExternalConversationResponse> listConversations(Authentication authentication) {
        User currentUser = resolveCurrentUser(authentication);

        return conversationRepository.findAllByUser1_IdOrUser2_IdOrderByUpdatedDateDesc(currentUser.getId(), currentUser.getId())
                .stream()
                .map(conversation -> toConversationResponse(conversation, currentUser))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ExternalMessageResponse> listMessages(Authentication authentication, Long conversationId) {
        User currentUser = resolveCurrentUser(authentication);
        ExternalConversation conversation = resolveConversationForUser(conversationId, currentUser);

        return messageRepository.findAllByConversation_IdOrderByCreatedDateAsc(conversation.getId())
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Transactional
    public ExternalMessageResponse sendMessage(Authentication authentication, ExternalMessageRequest request) {
        if (request == null || request.receiverId() == null) {
            throw new IllegalArgumentException("Receiver is required");
        }
        boolean hasContent = request.content() != null && !request.content().isBlank();
        boolean hasAttachment = request.url() != null && !request.url().isBlank();
        if (!hasContent && !hasAttachment) {
            throw new IllegalArgumentException("Message content is required");
        }

        User sender = resolveCurrentUser(authentication);
        User receiver = userRepository.findById(request.receiverId())
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found: " + request.receiverId()));

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("Cannot send a message to yourself");
        }

        boolean isComplaintChat = request.complaintChat() != null && request.complaintChat();
        ExternalConversation conversation = resolveOrCreateConversation(sender, receiver, isComplaintChat);

        ExternalMessage message = new ExternalMessage();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setMessage(hasContent ? request.content().trim() : "");
        message.setType(normalizeMessageType(request.type(), hasAttachment));
        message.setUrl(hasAttachment ? request.url().trim() : null);
        message.setCreatedDate(Instant.now());
        message = messageRepository.save(message);

        conversation.setUpdatedDate(message.getCreatedDate());
        conversationRepository.save(conversation);

        return toMessageResponse(message);
    }

    private ExternalConversation resolveOrCreateConversation(User sender, User receiver, boolean isComplaintChat) {
        String hash = buildParticipantsHash(sender.getId(), receiver.getId(), isComplaintChat);
        return conversationRepository.findByParticipantsHash(hash)
                .orElseGet(() -> {
                    ExternalConversation conversation = new ExternalConversation();
                    conversation.setId(nextConversationId());
                    conversation.setParticipantsHash(hash);
                    conversation.setComplaintChat(isComplaintChat);
                    if (sender.getId() < receiver.getId()) {
                        conversation.setUser1(sender);
                        conversation.setUser2(receiver);
                    } else {
                        conversation.setUser1(receiver);
                        conversation.setUser2(sender);
                    }
                    Instant now = Instant.now();
                    conversation.setCreatedDate(now);
                    conversation.setUpdatedDate(now);
                    return conversationRepository.save(conversation);
                });
    }

    private Long nextConversationId() {
        Long maxId = conversationRepository.findMaxId();
        return (maxId == null ? 0L : maxId) + 1;
    }

    private ExternalConversation resolveConversationForUser(Long conversationId, User currentUser) {
        ExternalConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found: " + conversationId));

        if (!isParticipant(conversation, currentUser)) {
            throw new IllegalArgumentException("You are not a participant of this conversation");
        }

        return conversation;
    }

    private ExternalConversationResponse toConversationResponse(ExternalConversation conversation, User currentUser) {
        User participant = conversation.getUser1().getId().equals(currentUser.getId())
                ? conversation.getUser2()
                : conversation.getUser1();
        ExternalMessage lastMessage = messageRepository.findTopByConversation_IdOrderByCreatedDateDesc(conversation.getId());

        return new ExternalConversationResponse(
                conversation.getId(),
                participant.getId(),
                participant.getFullName(),
                participant.getEmail(),
                participant.getRole() == null ? null : participant.getRole().name(),
                lastMessage == null ? null : summarizeLastMessage(lastMessage),
                lastMessage == null ? null : lastMessage.getCreatedDate(),
                conversation.getCreatedDate(),
                conversation.getUpdatedDate(),
                conversation.getComplaintChat()
        );
    }

    private ExternalMessageResponse toMessageResponse(ExternalMessage message) {
        return new ExternalMessageResponse(
                message.getId(),
                message.getConversation().getId(),
                message.getSender().getId(),
                message.getSender().getFullName(),
                message.getReceiver().getId(),
                message.getReceiver().getFullName(),
                message.getMessage(),
                message.getType(),
                message.getUrl(),
                message.getCreatedDate()
        );
    }

    private String normalizeMessageType(String rawType, boolean hasAttachment) {
        if (!hasAttachment) {
            return "text";
        }
        if (rawType == null || rawType.isBlank()) {
            return "image";
        }
        String type = rawType.trim().toLowerCase();
        return "video".equals(type) ? "video" : "image";
    }

    private String summarizeLastMessage(ExternalMessage message) {
        if (message.getUrl() != null && !message.getUrl().isBlank()) {
            return "video".equalsIgnoreCase(message.getType()) ? "[Video]" : "[Image]";
        }
        return message.getMessage();
    }

    private String buildParticipantsHash(Long firstUserId, Long secondUserId, boolean isComplaintChat) {
        long low = Math.min(firstUserId, secondUserId);
        long high = Math.max(firstUserId, secondUserId);
        return low + ":" + high + (isComplaintChat ? ":COMPLAINT" : "");
    }

    private boolean isParticipant(ExternalConversation conversation, User user) {
        return conversation.getUser1().getId().equals(user.getId())
                || conversation.getUser2().getId().equals(user.getId());
    }

    private User resolveCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalArgumentException("Authenticated user is required");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }
}
