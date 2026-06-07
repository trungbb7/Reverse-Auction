package vn.edu.hcmuaf.reverseauction;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.request.ExternalMessageRequest;
import vn.edu.hcmuaf.reverseauction.dto.response.ExternalMessageResponse;
import vn.edu.hcmuaf.reverseauction.entity.Role;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;
import vn.edu.hcmuaf.reverseauction.service.impl.ExternalChatService;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class ReverseAuctionApplicationTests {

    @Autowired
    private ExternalChatService externalChatService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @Transactional
    void testSendMessageAndCreateConversation() {
        User user1 = userRepository.findByEmail("test1@test.com").orElseGet(() -> {
            User u = User.builder()
                    .email("test1@test.com")
                    .password("password")
                    .fullName("Test User 1")
                    .role(Role.ROLE_BUYER)
                    .rating(0.0)
                    .totalReviews(0)
                    .enabled(true)
                    .build();
            return userRepository.save(u);
        });

        User user2 = userRepository.findByEmail("test2@test.com").orElseGet(() -> {
            User u = User.builder()
                    .email("test2@test.com")
                    .password("password")
                    .fullName("Test User 2")
                    .role(Role.ROLE_SELLER)
                    .rating(0.0)
                    .totalReviews(0)
                    .enabled(true)
                    .build();
            return userRepository.save(u);
        });

        Authentication auth = new UsernamePasswordAuthenticationToken(user1.getEmail(), null);
        ExternalMessageRequest request = new ExternalMessageRequest(user2.getId(), "First chat message!");

        ExternalMessageResponse response = externalChatService.sendMessage(auth, request);

        assertNotNull(response);
        assertNotNull(response.conversationId());
        System.out.println("Conversation ID generated: " + response.conversationId());
        System.out.println("Message: " + response.content());
    }
}
