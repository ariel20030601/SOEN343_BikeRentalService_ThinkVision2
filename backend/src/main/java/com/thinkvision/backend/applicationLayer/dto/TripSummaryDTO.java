package com.thinkvision.backend.applicationLayer.dto;

import lombok.Getter;

@Getter
public class TripSummaryDTO {
    private Long tripId;
    private String bikeType;
    private String startStationName;
    private String endStationName;
    private long startTime;
    private long endTime;
    private long durationMinutes;
    private double cost;

    public TripSummaryDTO(){}

    public TripSummaryDTO(Long tripId, String bikeType, String startStationName, String endStationName,
                          long startTime, long endTime, long durationMinutes, double cost) {
        this.tripId = tripId;
        this.bikeType = bikeType;
        this.startStationName = startStationName;
        this.endStationName = endStationName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
        this.cost = cost;
    }
}
