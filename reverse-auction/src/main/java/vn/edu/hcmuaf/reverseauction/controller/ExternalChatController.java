package vn.edu.hcmuaf.reverseauction.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmuaf.reverseauction.dto.request.ExternalMessageRequest;
import vn.edu.hcmuaf.reverseauction.dto.request.EnsureConversationRequest;
import vn.edu.hcmuaf.reverseauction.dto.response.ExternalConversationResponse;
import vn.edu.hcmuaf.reverseauction.dto.response.ExternalMessageResponse;
import vn.edu.hcmuaf.reverseauction.service.impl.ExternalChatService;

import java.util.List;

@RestController
@RequestMapping("/api/external-chats")
@Tag(name = "External Chat")
@RequiredArgsConstructor
public class ExternalChatController {
    private final ExternalChatService externalChatService;

    @GetMapping("/conversations")
    public ResponseEntity<List<ExternalConversationResponse>> listConversations(Authentication authentication) {
        return ResponseEntity.ok(externalChatService.listConversations(authentication));
    }

    @PostMapping("/conversations/ensure")
    public ResponseEntity<ExternalConversationResponse> ensureConversation(
            Authentication authentication,
            @RequestBody EnsureConversationRequest request
    ) {
        return ResponseEntity.ok(externalChatService.ensureConversation(authentication, request));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<ExternalMessageResponse>> listMessages(
            Authentication authentication,
            @PathVariable Long conversationId
    ) {
        return ResponseEntity.ok(externalChatService.listMessages(authentication, conversationId));
    }

    @PostMapping("/messages")
    public ResponseEntity<ExternalMessageResponse> sendMessage(
            Authentication authentication,
            @RequestBody ExternalMessageRequest request
    ) {
        return ResponseEntity.ok(externalChatService.sendMessage(authentication, request));
    }
}
