package com.thinkvision.backend.applicationLayer.loyalty;

import com.thinkvision.backend.entity.User;
import com.thinkvision.backend.entity.LoyaltyTier;

public interface NotificationService {
    void notifyTierChange(User user, LoyaltyTier from, LoyaltyTier to, boolean visual);
}

