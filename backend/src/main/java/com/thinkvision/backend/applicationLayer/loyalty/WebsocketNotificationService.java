package com.thinkvision.backend.applicationLayer.loyalty;

import com.thinkvision.backend.entity.LoyaltyTier;
import com.thinkvision.backend.entity.User;
import org.springframework.context.annotation.Primary;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Primary
@Service
public class WebsocketNotificationService implements NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public WebsocketNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void notifyTierChange(User user, LoyaltyTier from, LoyaltyTier to, boolean visual) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", user.getId());
        payload.put("from", from);
        payload.put("to", to);
        payload.put("visual", visual);
        // send to a user-specific topic
        messagingTemplate.convertAndSend("/topic/loyalty/" + user.getId(), payload);
    }
}
