package com.thinkvision.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.Instant;

@Entity
@Table(name = "trip_receipts")
public class TripReceipt {

    @Id
    @Getter
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Getter
    @Column (name = "trip_id", nullable = false)
    private Long tripId;

    @Getter
    @Column(name = "user_id")
    private Integer userId;

    @Getter
    @Column (name = "start_date")
    private Instant startDate;

    @Getter
    @Column (name = "end_date")
    private Instant endDate;

    @Getter
    @Column (name = "bike_id", nullable = false)
    private String bikeId;

    @Getter
    @Column (name = "start_station_id", nullable = false)
    private String startStationId;

    @Getter
    @Column (name = "end_station_id", nullable = false)
    private String endStationId;

    @Getter
    @Column(name = "fare", nullable = false)
    private double fare;

    public TripReceipt() {}

    public TripReceipt(Long tripId, Integer userId, Instant startDate, Instant endDate,
            String bikeId, String startStationId, String endStationId, double fare) {
        this.tripId = tripId;
        this.fare = fare;
        this.startDate = startDate;
        this.endDate = endDate;
        this.bikeId = bikeId;
        this.startStationId = startStationId;
        this.endStationId = endStationId;
        this.userId = userId;
    }
}
