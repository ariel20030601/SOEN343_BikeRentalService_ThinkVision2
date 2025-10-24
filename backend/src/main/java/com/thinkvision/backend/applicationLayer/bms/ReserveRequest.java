package com.thinkvision.backend.applicationLayer.bms;

public record ReserveRequest(Integer riderId, String stationId, String bikeId) {}