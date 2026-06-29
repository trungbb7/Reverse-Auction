package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmuaf.reverseauction.dto.ai.AiChatRequest;
import vn.edu.hcmuaf.reverseauction.dto.ai.AiChatResponse;
import vn.edu.hcmuaf.reverseauction.service.impl.AiChatService;

@RestController
@RequestMapping("/api/ai-chat")
@RequiredArgsConstructor
public class AiChatController {
    private final AiChatService aiChatService;

    @PostMapping("/messages")
    public ResponseEntity<AiChatResponse> chat(
            Authentication authentication,
            @RequestBody AiChatRequest request
    ) {
        return ResponseEntity.ok(aiChatService.reply(authentication, request));
    }
}
