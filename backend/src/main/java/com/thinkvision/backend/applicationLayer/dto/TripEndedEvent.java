package com.thinkvision.backend.applicationLayer.dto;

import java.time.Instant;

public class TripEndedEvent {
    private final Long tripId;
    private final Instant timestamp;

    public TripEndedEvent(Long tripId) {
        this.tripId = tripId;
        this.timestamp = Instant.now();
    }

    public Long getTripId() {
        return tripId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }
}
