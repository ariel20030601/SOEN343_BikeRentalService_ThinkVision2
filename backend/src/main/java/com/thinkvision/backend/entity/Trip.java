package com.thinkvision.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rider_id", nullable = false)
    private String riderId;

    @Column(name = "bike_id", nullable = false)
    private String bikeId;

    @Column(name = "start_station_id")
    private String startStationId;

    @Column(name = "end_station_id")
    private String endStationId;

    @Column(name = "start_time")
    private Instant startTime;

    @Column(name = "end_time")
    private Instant endTime;

    @Column(name = "active")
    private boolean active;

    public Trip() {}

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRiderId() { return riderId; }
    public void setRiderId(String riderId) { this.riderId = riderId; }

    public String getBikeId() { return bikeId; }
    public void setBikeId(String bikeId) { this.bikeId = bikeId; }

    public String getStartStationId() { return startStationId; }
    public void setStartStationId(String startStationId) { this.startStationId = startStationId; }

    public String getEndStationId() { return endStationId; }
    public void setEndStationId(String endStationId) { this.endStationId = endStationId; }

    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }

    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}

