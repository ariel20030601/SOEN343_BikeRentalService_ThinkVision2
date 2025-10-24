package com.thinkvision.backend.applicationLayer.bms;

public record CheckoutRequest(Integer riderId, String stationId, String bikeId) {}