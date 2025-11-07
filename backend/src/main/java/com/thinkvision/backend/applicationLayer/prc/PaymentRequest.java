package com.thinkvision.backend.applicationLayer.prc;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PaymentRequest {
    private Long tripId;
    private Integer userId;
    private double amount;
    private String currency;
    private String description;

    public PaymentRequest() {}

    public PaymentRequest(Long tripId, Integer userId, double amount, String currency, String description) {
        this.tripId = tripId;
        this.userId = userId;
        this.amount = amount;
        this.currency = currency;
        this.description = description;
    }

}
