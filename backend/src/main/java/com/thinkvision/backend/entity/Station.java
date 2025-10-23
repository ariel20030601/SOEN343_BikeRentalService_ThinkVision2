package com.thinkvision.backend.entity;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Entity
@Table(name = "stations")
public class Station {

    @Id
    private String id;

    @Column(unique = true)
    private String code;

    @Column(name = "available_bikes")
    private int availableBikes;

    @Column(name = "total_docks")
    private int totalDocks;

    @Column(name = "out_of_service")
    private boolean outOfService = false;

    /**
     * Optional per-station reservation expiry override in minutes.
     * Nullable: when null, the default expiry should be used.
     */
    @Column(name = "expires_after_minutes")
    private Integer expiresAfterMinutes;

    /**
     * Simple collection of bike ids present at this station. Kept lightweight so
     * hasBike(...) can be implemented without a full relationship mapping.
     */
    @ElementCollection
    private Set<String> bikeIds = new HashSet<>();

    public Station() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public int getAvailableBikes() {
        return availableBikes;
    }

    public void setAvailableBikes(int availableBikes) {
        this.availableBikes = availableBikes;
    }

    public int getTotalDocks() {
        return totalDocks;
    }

    public void setTotalDocks(int totalDocks) {
        this.totalDocks = totalDocks;
    }

    public boolean isOutOfService() {
        return outOfService;
    }

    public void setOutOfService(boolean outOfService) {
        this.outOfService = outOfService;
    }

    public Optional<Long> getExpiresAfterMinutes() {
        return expiresAfterMinutes == null ? Optional.empty() : Optional.of(expiresAfterMinutes.longValue());
    }

    public void setExpiresAfterMinutes(Integer expiresAfterMinutes) {
        this.expiresAfterMinutes = expiresAfterMinutes;
    }

    public Set<String> getBikeIds() {
        return bikeIds;
    }

    public void setBikeIds(Set<String> bikeIds) {
        this.bikeIds = bikeIds;
    }

    public boolean hasBike(String bikeId) {
        return bikeIds != null && bikeIds.contains(bikeId);
    }

    public void decrementAvailableBikes() {
        if (availableBikes > 0) availableBikes--;
    }

    public void incrementAvailableBikes() {
        if (availableBikes < totalDocks) availableBikes++;
    }
}
