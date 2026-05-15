package vn.edu.hcmuaf.reverseauction.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import vn.edu.hcmuaf.reverseauction.dto.request.ExternalMessageRequest;
import vn.edu.hcmuaf.reverseauction.dto.response.ExternalMessageResponse;
import vn.edu.hcmuaf.reverseauction.entity.ExternalConversation;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.repository.ExternalConversationRepository;
import vn.edu.hcmuaf.reverseauction.service.impl.ChatMessageService;
import vn.edu.hcmuaf.reverseauction.service.impl.JwtServiceImpl;

import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatWebSocketHandler extends TextWebSocketHandler {
    JwtServiceImpl jwtService;
    ExternalConversationRepository conversationRepository;
    ChatMessageService chatMessageService;
    final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    Map<Long, Set<WebSocketSession>> sessionsByConversation = new ConcurrentHashMap<>();
    Map<String, Long> sessionConversationMap = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        try {
            String token = getQueryParameter(session.getUri(), "token");
            if (!StringUtils.hasText(token)) {
                session.close(new CloseStatus(CloseStatus.NOT_ACCEPTABLE.getCode(), "Missing token"));
                return;
            }

            String userEmail = jwtService.extractUsername(token);
            Long userId = jwtService.extractUserId(token);
            session.getAttributes().put("userEmail", userEmail);
            session.getAttributes().put("userId", userId);

            String conversationIdValue = getQueryParameter(session.getUri(), "conversationId");
            if (StringUtils.hasText(conversationIdValue)) {
                Long conversationId = Long.valueOf(conversationIdValue);
                ensureParticipant(userId, conversationId);
                registerSession(session, conversationId);
            }

            log.info("Chat websocket connected: userEmail={}, conversationId={}", userEmail, conversationIdValue);
        } catch (Exception ex) {
            log.warn("Chat websocket rejected: {}", ex.getMessage());
            session.close(new CloseStatus(CloseStatus.NOT_ACCEPTABLE.getCode(), ex.getMessage()));
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String userEmail = (String) session.getAttributes().get("userEmail");
        if (!StringUtils.hasText(userEmail)) {
            session.close(new CloseStatus(CloseStatus.NOT_ACCEPTABLE.getCode(), "Unauthenticated session"));
            return;
        }

        ExternalMessageRequest request = objectMapper.readValue(message.getPayload(), ExternalMessageRequest.class);
        ExternalMessageResponse response = chatMessageService.send(
                userEmail,
                request
        );

        registerSession(session, response.conversationId());
        broadcast(response.conversationId(), response);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long conversationId = sessionConversationMap.remove(session.getId());
        if (conversationId == null) {
            return;
        }

        Set<WebSocketSession> sessions = sessionsByConversation.get(conversationId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                sessionsByConversation.remove(conversationId);
            }
        }
    }

    private void registerSession(WebSocketSession session, Long conversationId) {
        Long previousConversationId = sessionConversationMap.put(session.getId(), conversationId);
        if (previousConversationId != null && !previousConversationId.equals(conversationId)) {
            Set<WebSocketSession> previousSessions = sessionsByConversation.get(previousConversationId);
            if (previousSessions != null) {
                previousSessions.remove(session);
                if (previousSessions.isEmpty()) {
                    sessionsByConversation.remove(previousConversationId);
                }
            }
        }

        sessionsByConversation
                .computeIfAbsent(conversationId, ignored -> ConcurrentHashMap.newKeySet())
                .add(session);
        session.getAttributes().put("conversationId", conversationId);
    }

    private void broadcast(Long conversationId, ExternalMessageResponse response) throws IOException {
        String payload = objectMapper.writeValueAsString(response);
        Set<WebSocketSession> sessions = sessionsByConversation.get(conversationId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }

        for (WebSocketSession wsSession : sessions.toArray(WebSocketSession[]::new)) {
            if (wsSession.isOpen()) {
                try {
                    wsSession.sendMessage(new TextMessage(payload));
                } catch (IOException ex) {
                    log.warn("Failed to broadcast chat message to session {}: {}", wsSession.getId(), ex.getMessage());
                    sessions.remove(wsSession);
                }
            } else {
                sessions.remove(wsSession);
            }
        }
    }

    private void ensureParticipant(Long userId, Long conversationId) {
        ExternalConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found: " + conversationId));

        boolean participantExists = isParticipant(conversation, userId);
        if (!participantExists) {
            throw new IllegalArgumentException("You are not a participant of this conversation");
        }
    }

    private boolean isParticipant(ExternalConversation conversation, Long userId) {
        return matchesUser(conversation.getUser1(), userId)
                || matchesUser(conversation.getUser2(), userId);
    }

    private boolean matchesUser(User user, Long userId) {
        return user != null && userId != null && userId.equals(user.getId());
    }

    private String getQueryParameter(URI uri, String name) {
        if (uri == null || !StringUtils.hasText(uri.getQuery())) {
            return null;
        }

        for (String pair : uri.getQuery().split("&")) {
            String[] keyValue = pair.split("=", 2);
            if (keyValue.length == 2 && name.equals(keyValue[0])) {
                return URLDecoder.decode(keyValue[1], StandardCharsets.UTF_8);
            }
        }

        return null;
    }
}
