package com.thinkvision.backend.applicationLayer;

public record CheckoutRequest(String riderId, Long stationId, String bikeId) {}