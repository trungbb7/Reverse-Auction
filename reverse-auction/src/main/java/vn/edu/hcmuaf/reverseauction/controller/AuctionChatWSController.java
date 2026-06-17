package vn.edu.hcmuaf.reverseauction.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import vn.edu.hcmuaf.reverseauction.dto.CreateMessageRequest;
import vn.edu.hcmuaf.reverseauction.dto.MessageResponse;
import vn.edu.hcmuaf.reverseauction.service.impl.MessageService;

@Controller
@RequiredArgsConstructor
@Slf4j
public class AuctionChatWSController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/auction/{auctionId}/chat")
    public void handleChatMessage(
            Authentication authentication,
            @DestinationVariable Long auctionId,
            @Payload CreateMessageRequest request
    ) {
        log.info("Received auction chat message: auctionId={}, content={}", auctionId, request.content());
        
        // Save message to database
        MessageResponse response = messageService.sendMessage(authentication, request);
        
        // Broadcast to sender and receiver
        String destinationSender = "/topic/auction/" + auctionId + "/chat/" + response.senderId();
        String destinationReceiver = "/topic/auction/" + auctionId + "/chat/" + response.receiverId();
        
        messagingTemplate.convertAndSend(destinationSender, response);
        messagingTemplate.convertAndSend(destinationReceiver, response);
    }
}
