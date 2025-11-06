package com.thinkvision.backend.applicationLayer.prc;

public interface PricingPlan {

    public double getFare(long durationInMinutes);

    String getPlanName();
    double getBaseFare();
    double getAdditionalFarePerMinute();

}
