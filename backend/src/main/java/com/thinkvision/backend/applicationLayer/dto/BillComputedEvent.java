package com.thinkvision.backend.applicationLayer.dto;

import com.thinkvision.backend.entity.Bike;
import com.thinkvision.backend.entity.Trip;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class BillComputedEvent {

    private final Trip trip;
    private final Bike bike;
    private final double cost;

    public BillComputedEvent(Trip trip, Bike bike, double cost) {
        this.trip = trip;
        this.bike = bike;
        this.cost = cost;
    }

}
