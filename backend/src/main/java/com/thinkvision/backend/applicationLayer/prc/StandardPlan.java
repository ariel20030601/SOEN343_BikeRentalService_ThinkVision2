package com.thinkvision.backend.applicationLayer.prc;

import org.springframework.stereotype.Component;

@Component
public class StandardPlan implements  PricingPlan {
    private static final String PLAN_NAME = "Standard Bike Plan";
    private static final double BASE_FARE = 10.0; // Base fare for the first 30 minutes
    private static final double ADDITIONAL_FARE_PER_MINUTE = 0.25; // Fare per additional minute after 30 minutes

    @Override
    public double getFare(long durationInMinutes) {
        if (durationInMinutes <= 30) {
            return BASE_FARE;
        } else {
            long additionalMinutes = durationInMinutes - 30;
            return BASE_FARE + (additionalMinutes * ADDITIONAL_FARE_PER_MINUTE);
        }
    }

    @Override
    public String getPlanName() {
        return "";
    }

    @Override
    public double getBaseFare() {
        return 0;
    }

    @Override
    public double getAdditionalFarePerMinute() {
        return 0;
    }
}
