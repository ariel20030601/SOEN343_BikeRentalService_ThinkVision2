package com.thinkvision.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    private String id;

    @Column(name = "bike_id")
    private String bikeId;

    @Column(name = "rider_id")
    private String riderId;

    @Column(name = "station_id")
    private String stationId;

    @Column(name = "reserved_at")
    private Instant reservedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "active")
    private boolean active;

    public Reservation() {}

    public Reservation(String riderId, String bikeId, String stationId, Instant reservedAt, Instant expiresAt, boolean active) {
        this.riderId = riderId;
        this.bikeId = bikeId;
        this.stationId = stationId;
        this.reservedAt = reservedAt;
        this.expiresAt = expiresAt;
        this.active = active;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBikeId() {
        return bikeId;
    }

    public void setBikeId(String bikeId) {
        this.bikeId = bikeId;
    }

    public String getRiderId() {
        return riderId;
    }

    public void setRiderId(String riderId) {
        this.riderId = riderId;
    }

    public String getStationId() {
        return stationId;
    }

    public void setStationId(String stationId) {
        this.stationId = stationId;
    }

    public Instant getReservedAt() {
        return reservedAt;
    }

    public void setReservedAt(Instant reservedAt) {
        this.reservedAt = reservedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
