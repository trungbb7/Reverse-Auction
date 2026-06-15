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


}
