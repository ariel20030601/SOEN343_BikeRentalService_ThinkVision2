package com.thinkvision.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "trips")
@Getter
@Setter
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_id", nullable = false)
    private User rider;

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

    @Column(name = "flex_applied", nullable = false)
    private boolean flexApplied = false;

    public boolean isFlexApplied() {
        return flexApplied;
    }

    public void setFlexApplied(boolean flexApplied) {
        this.flexApplied = flexApplied;
    }

    public Trip() {}

}

