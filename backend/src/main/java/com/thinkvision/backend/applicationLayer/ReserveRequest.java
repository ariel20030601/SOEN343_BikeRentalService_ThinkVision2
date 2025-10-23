package com.thinkvision.backend.applicationLayer;

public record ReserveRequest(String riderId, Long stationId, String bikeId) {}