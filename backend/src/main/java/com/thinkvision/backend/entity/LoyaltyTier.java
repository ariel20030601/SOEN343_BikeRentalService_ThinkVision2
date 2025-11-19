package com.thinkvision.backend.entity;

public enum LoyaltyTier {
    NONE(0, 0),
    BRONZE(5, 0),  // 5% discount, 0 sec extra hold
    SILVER(10, 120); // 10% discount, +120 seconds extra hold (2 minutes)

    private final int discountPercent;
    private final int extraHoldSeconds;

    LoyaltyTier(int discountPercent, int extraHoldSeconds) {
        this.discountPercent = discountPercent;
        this.extraHoldSeconds = extraHoldSeconds;
    }

    public int getDiscountPercent() {
        return discountPercent;
    }

    public int getExtraHoldSeconds() {
        return extraHoldSeconds;
    }
}
