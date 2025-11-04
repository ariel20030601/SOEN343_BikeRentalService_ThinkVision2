package com.thinkvision.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;

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
    @Column(name = "fare", nullable = false)
    private double fare;

    public TripReceipt() {}

    public TripReceipt(Long tripId, Integer userId, double fare) {
        this.tripId = tripId;
        this.fare = fare;
        this.userId = userId;
    }
}
