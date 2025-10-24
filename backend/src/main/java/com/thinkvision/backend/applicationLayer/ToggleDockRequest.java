package com.thinkvision.backend.applicationLayer;

public record ToggleDockRequest(Long dockId, boolean outOfService, String operatorId) {}