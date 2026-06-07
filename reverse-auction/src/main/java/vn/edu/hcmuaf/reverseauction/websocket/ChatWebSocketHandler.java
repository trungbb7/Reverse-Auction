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
    ChatMessageService chatMessageService;
    final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    Map<Long, Set<WebSocketSession>> sessionsByUserId = new ConcurrentHashMap<>();

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

            // Register session by userId
            sessionsByUserId
                    .computeIfAbsent(userId, ignored -> ConcurrentHashMap.newKeySet())
                    .add(session);

            log.info("Chat websocket connected: userEmail={}, userId={}", userEmail, userId);
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

        log.info("Received chat message payload: {}", message.getPayload());
        ExternalMessageRequest request = objectMapper.readValue(message.getPayload(), ExternalMessageRequest.class);
        ExternalMessageResponse response = chatMessageService.send(
                userEmail,
                request
        );

        broadcast(response);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long userId = (Long) session.getAttributes().get("userId");
        if (userId != null) {
            Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    sessionsByUserId.remove(userId);
                }
            }
        }
    }

    private void broadcast(ExternalMessageResponse response) throws IOException {
        String payload = objectMapper.writeValueAsString(response);
        sendToUser(response.senderId(), payload);
        sendToUser(response.receiverId(), payload);
    }

    private void sendToUser(Long userId, String payload) {
        if (userId == null) return;
        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }

        for (WebSocketSession wsSession : sessions.toArray(WebSocketSession[]::new)) {
            if (wsSession.isOpen()) {
                try {
                    wsSession.sendMessage(new TextMessage(payload));
                } catch (IOException ex) {
                    log.warn("Failed to send chat message to session {}: {}", wsSession.getId(), ex.getMessage());
                    sessions.remove(wsSession);
                }
            } else {
                sessions.remove(wsSession);
            }
        }
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
