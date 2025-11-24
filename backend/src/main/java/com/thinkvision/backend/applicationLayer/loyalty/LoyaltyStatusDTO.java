package com.thinkvision.backend.applicationLayer.loyalty;

import lombok.Getter;

@Getter
public class LoyaltyStatusDTO {
    private final String currentTier;
    private final String computedTier;
    private final int discountPercent;
    private final int extraHoldSeconds;

    public LoyaltyStatusDTO(String currentTier, String computedTier, int discountPercent, int extraHoldSeconds) {
        this.currentTier = currentTier;
        this.computedTier = computedTier;
        this.discountPercent = discountPercent;
        this.extraHoldSeconds = extraHoldSeconds;
    }

}
