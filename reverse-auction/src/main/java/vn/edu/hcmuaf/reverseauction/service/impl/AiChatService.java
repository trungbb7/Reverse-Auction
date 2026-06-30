package vn.edu.hcmuaf.reverseauction.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.dto.ai.AiAction;
import vn.edu.hcmuaf.reverseauction.dto.ai.AiChatRequest;
import vn.edu.hcmuaf.reverseauction.dto.ai.AiChatResponse;
import vn.edu.hcmuaf.reverseauction.dto.ai.AiChatTurn;
import vn.edu.hcmuaf.reverseauction.entity.AuctionRequest;
import vn.edu.hcmuaf.reverseauction.entity.Order;
import vn.edu.hcmuaf.reverseauction.entity.Policy;
import vn.edu.hcmuaf.reverseauction.entity.Product;
import vn.edu.hcmuaf.reverseauction.entity.Role;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.repository.AuctionRepository;
import vn.edu.hcmuaf.reverseauction.repository.OrderRepository;
import vn.edu.hcmuaf.reverseauction.repository.PolicyRepository;
import vn.edu.hcmuaf.reverseauction.repository.ProductRepository;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatService {
    private static final Set<String> ALLOWED_ACTIONS = Set.of(
            "VIEW_PRODUCT",
            "VIEW_ORDER",
            "VIEW_AUCTION",
            "OPEN_CHAT_WITH_SELLER",
            "CREATE_COMPLAINT_DRAFT",
            "START_AUCTION_DRAFT",
            "SUGGEST_BID_DRAFT"
    );

    private final ProductRepository productRepository;
    private final PolicyRepository policyRepository;
    private final OrderRepository orderRepository;
    private final AuctionRepository auctionRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${app.ai.provider:gemini}")
    private String provider;

    @Value("${app.ai.openrouter.api-key:}")
    private String openRouterApiKey;

    @Value("${app.ai.openrouter.model:google/gemma-4-31b-it:free}")
    private String openRouterModel;

    @Value("${app.ai.timeout-seconds:20}")
    private long timeoutSeconds;

    @Transactional(readOnly = true)
    public AiChatResponse reply(Authentication authentication, AiChatRequest request) {
        User user = authentication != null && authentication.getPrincipal() instanceof User principal
                ? principal
                : null;
        String message = sanitizeMessage(request);
        ChatContext context = buildContext(user);

        if (!"openrouter".equalsIgnoreCase(provider)) {
            throw new IllegalStateException("Only OpenRouter AI provider is enabled.");
        }

        if (openRouterApiKey == null || openRouterApiKey.isBlank()) {
            throw new IllegalStateException("Missing OpenRouter API key.");
        }

        try {
            return callOpenRouter(message, request.history(), context);
        } catch (Exception exception) {
            log.warn("OpenRouter AI request failed: {}", exception.getMessage());
            throw new IllegalStateException("OpenRouter AI request failed. Please check API key, model, quota, or network.", exception);
        }
    }

    private String sanitizeMessage(AiChatRequest request) {
        String value = request != null && request.message() != null ? request.message().trim() : "";
        if (value.length() > 1000) {
            return value.substring(0, 1000);
        }
        return value.isBlank() ? "Xin chao" : value;
    }

    private ChatContext buildContext(User user) {
        List<Product> products = productRepository.findAll(
                PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
        List<Policy> policies = policyRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .limit(5)
                .toList();
        List<AuctionRequest> auctions = auctionRepository.findAll(
                PageRequest.of(0, 6, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();
        List<Order> orders = List.of();

        if (user != null) {
            if (user.getRole() == Role.ROLE_SELLER) {
                orders = orderRepository.findBySeller_Id(user.getId()).stream().limit(6).toList();
            } else if (user.getRole() == Role.ROLE_ADMIN) {
                orders = orderRepository.findAll(PageRequest.of(0, 6, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent();
            } else {
                orders = orderRepository.findByBuyer_Id(user.getId()).stream().limit(6).toList();
            }
        }

        return new ChatContext(user, products, policies, auctions, orders);
    }

    private AiChatResponse callOpenRouter(String message, List<AiChatTurn> history, ChatContext context) throws Exception {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", openRouterModel);
        body.put("max_tokens", 900);
        body.put("temperature", 0.35);

        ArrayNode messages = body.putArray("messages");
        messages.addObject()
                .put("role", "system")
                .put("content", systemInstruction());
        addOpenRouterHistory(messages, history);
        messages.addObject()
                .put("role", "user")
                .put("content", "User question: " + message + "\n\nContext:\n" + context.toPrompt());

        String endpoint = "https://openrouter.ai/api/v1/chat/completions";

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + openRouterApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("OpenRouter request failed: " + response.statusCode() + " - " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        String text = root.path("choices").path(0).path("message").path("content").asText();
        if (text == null || text.isBlank()) {
            throw new IllegalStateException("OpenRouter response did not contain message content: " + response.body());
        }
        JsonNode aiJson = objectMapper.readTree(extractJson(text));
        String answer = aiJson.path("message").asText("Toi chua co cau tra loi phu hop.");
        List<AiAction> actions = parseActions(aiJson.path("suggestedActions"), context);

        return new AiChatResponse(answer, actions, "openrouter");
    }

    private void addOpenRouterHistory(ArrayNode messages, List<AiChatTurn> history) {
        if (history == null) {
            return;
        }

        history.stream()
                .filter(turn -> turn.content() != null && !turn.content().isBlank())
                .skip(Math.max(0, history.size() - 6))
                .forEach(turn -> messages.addObject()
                        .put("role", "assistant".equalsIgnoreCase(turn.role()) ? "assistant" : "user")
                        .put("content", turn.content()));
    }

    private String systemInstruction() {
        return """
                You are the AI assistant for a Vietnamese reverse-auction ecommerce web app.
                Answer in Vietnamese, concise and practical.
                Use only the provided context. Do not invent IDs, order states, prices, policies, or permissions.
                You may suggest actions, but you must not claim that an action has already been executed.
                Return only valid JSON:
                {
                  "message": "string",
                  "suggestedActions": [
                    {"type": "VIEW_PRODUCT|VIEW_ORDER|VIEW_AUCTION|OPEN_CHAT_WITH_SELLER|CREATE_COMPLAINT_DRAFT|START_AUCTION_DRAFT|SUGGEST_BID_DRAFT", "label": "string", "payload": {}}
                  ]
                }
                For write-like actions, present them as drafts or proposals requiring user confirmation.
                """;
    }

    private String extractJson(String text) {
        if (text == null || text.isBlank()) {
            return "{\"message\":\"Toi chua co cau tra loi phu hop.\",\"suggestedActions\":[]}";
        }

        String cleaned = text.replace("```json", "").replace("```", "").trim();
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return cleaned.substring(start, end + 1);
        }
        return cleaned;
    }

    private List<AiAction> parseActions(JsonNode actionsNode, ChatContext context) {
        List<AiAction> actions = new ArrayList<>();
        if (!actionsNode.isArray()) {
            return actions;
        }

        for (JsonNode actionNode : actionsNode) {
            String type = actionNode.path("type").asText("");
            if (!ALLOWED_ACTIONS.contains(type) || actions.size() >= 3) {
                continue;
            }

            Map<String, Object> payload = objectMapper.convertValue(actionNode.path("payload"), Map.class);
            AiAction action = new AiAction(
                    type,
                    actionNode.path("label").asText(defaultLabel(type)),
                    payload != null ? payload : Map.of()
            );

            if (isActionAllowed(action, context)) {
                actions.add(action);
            }
        }
        return actions;
    }

    private boolean isActionAllowed(AiAction action, ChatContext context) {
        if ("VIEW_PRODUCT".equals(action.type())) {
            Long productId = longPayload(action, "productId");
            return productId != null && context.products().stream().anyMatch(product -> product.getId().equals(productId));
        }
        if ("VIEW_ORDER".equals(action.type())) {
            Long orderId = longPayload(action, "orderId");
            return orderId != null && context.orders().stream().anyMatch(order -> order.getId().equals(orderId));
        }
        if ("VIEW_AUCTION".equals(action.type())) {
            Long auctionId = longPayload(action, "auctionId");
            return auctionId != null && context.auctions().stream().anyMatch(auction -> auction.getId().equals(auctionId));
        }
        if ("OPEN_CHAT_WITH_SELLER".equals(action.type())) {
            Long sellerId = longPayload(action, "sellerId");
            return sellerId != null && context.products().stream()
                    .anyMatch(product -> product.getSeller() != null && product.getSeller().getId().equals(sellerId));
        }
        return true;
    }

    private Long longPayload(AiAction action, String key) {
        Object value = action.payload().get(key);
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text) {
            try {
                return Long.parseLong(text);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private String defaultLabel(String type) {
        return switch (type) {
            case "VIEW_PRODUCT" -> "Xem san pham";
            case "VIEW_ORDER" -> "Xem don hang";
            case "VIEW_AUCTION" -> "Xem dau gia";
            case "OPEN_CHAT_WITH_SELLER" -> "Mo chat voi seller";
            case "CREATE_COMPLAINT_DRAFT" -> "Tao khieu nai nhap";
            case "START_AUCTION_DRAFT" -> "Tao yeu cau dau gia";
            case "SUGGEST_BID_DRAFT" -> "Goi y bid";
            default -> "Thuc hien";
        };
    }

    private record ChatContext(
            User user,
            List<Product> products,
            List<Policy> policies,
            List<AuctionRequest> auctions,
            List<Order> orders
    ) {
        private String toPrompt() {
            StringBuilder builder = new StringBuilder();
            if (user != null) {
                builder.append("Current user: id=").append(user.getId())
                        .append(", name=").append(user.getFullName())
                        .append(", role=").append(user.getRole())
                        .append("\n");
            } else {
                builder.append("Current user: anonymous\n");
            }

            builder.append("\nProducts:\n");
            for (Product product : products) {
                builder.append("- id=").append(product.getId())
                        .append(", name=").append(product.getName())
                        .append(", price=").append(product.getPrice())
                        .append(", category=").append(product.getCategory() != null ? product.getCategory().getName() : "")
                        .append(", sellerId=").append(product.getSeller() != null ? product.getSeller().getId() : "")
                        .append(", seller=").append(product.getSeller() != null ? product.getSeller().getFullName() : "")
                        .append("\n");
            }

            builder.append("\nPolicies:\n");
            for (Policy policy : policies) {
                builder.append("- id=").append(policy.getId())
                        .append(", type=").append(policy.getType())
                        .append(", title=").append(policy.getTitle())
                        .append(", content=").append(trimStatic(policy.getContent(), 500))
                        .append("\n");
            }

            builder.append("\nAuctions:\n");
            for (AuctionRequest auction : auctions) {
                builder.append("- id=").append(auction.getId())
                        .append(", title=").append(auction.getTitle())
                        .append(", budgetMax=").append(auction.getBudgetMax())
                        .append(", status=").append(auction.getStatus())
                        .append(", endDate=").append(auction.getEndDate())
                        .append("\n");
            }

            builder.append("\nVisible orders:\n");
            for (Order order : orders) {
                builder.append("- id=").append(order.getId())
                        .append(", code=").append(order.getCode())
                        .append(", status=").append(order.getStatus())
                        .append(", total=").append(order.getTotalAmount())
                        .append(", item=").append(order.getProduct() != null ? order.getProduct().getName() : order.getAuction() != null ? order.getAuction().getTitle() : "")
                        .append("\n");
            }
            return builder.toString();
        }

        private static String trimStatic(String value, int max) {
            if (value == null || value.length() <= max) {
                return value;
            }
            return value.substring(0, max) + "...";
        }
    }
}
