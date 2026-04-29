package vn.edu.hcmuaf.reverseauction.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmuaf.reverseauction.dto.MessageResponse;
import vn.edu.hcmuaf.reverseauction.dto.CreateMessageRequest;
import vn.edu.hcmuaf.reverseauction.service.MessageService;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@Tag(name = "Message")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(Authentication authentication, @RequestBody CreateMessageRequest request) {
        return ResponseEntity.ok(messageService.sendMessage(authentication, request));
    }

    @GetMapping
    public ResponseEntity<List<MessageResponse>> listMessages(@RequestParam(required = false) Long auctionId) {
        return ResponseEntity.ok(messageService.listMessages(auctionId));
    }
}
