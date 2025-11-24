package com.thinkvision.backend.applicationLayer.loyalty;

import com.thinkvision.backend.entity.User;
import com.thinkvision.backend.entity.LoyaltyTier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SimpleNotificationService implements NotificationService {
    private static final Logger log = LoggerFactory.getLogger(SimpleNotificationService.class);

    @Override
    public void notifyTierChange(User user, LoyaltyTier from, LoyaltyTier to, boolean visual) {
        // Hook for real notification (push, email). For now just log.
        if (visual && to != from) {
            log.info("Visual notification for user {}: Tier changed from {} -> {}", user.getId(), from, to);
        } else if (to != from) {
            log.info("Notification for user {}: Tier changed from {} -> {}", user.getId(), from, to);
        }
    }
}

