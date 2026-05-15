package vn.edu.hcmuaf.reverseauction.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.reverseauction.dto.request.ExternalMessageRequest;
import vn.edu.hcmuaf.reverseauction.dto.response.ExternalMessageResponse;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageService {
    ExternalChatService externalChatService;

    public ExternalMessageResponse send(String userEmail, ExternalMessageRequest request) {
        var authentication = new UsernamePasswordAuthenticationToken(userEmail, null);
        return externalChatService.sendMessage(authentication, request);
    }
}
