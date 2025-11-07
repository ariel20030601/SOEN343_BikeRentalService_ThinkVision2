package com.thinkvision.backend.applicationLayer.dto;

import com.thinkvision.backend.entity.Trip;
import lombok.Getter;

@Getter
public class ProcessPaymentEvent {
    private Trip trip;
    private double cost;

    public ProcessPaymentEvent(Trip trip, double cost) {
        this.trip = trip;
        this.cost = cost;
    }
}
