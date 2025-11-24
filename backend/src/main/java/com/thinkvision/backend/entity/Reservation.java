package com.thinkvision.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "reservations")
@Getter
@Setter
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bike_id")
    private String bikeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_id")
    private User rider;

    @Column(name = "station_id")
    private String stationId;

    @Column(name = "reserved_at")
    private Instant reservedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "active")
    private boolean active;

    @Column(name = "claimed_at")
    private Instant claimedAt;

    @Column(name = "returned_at")
    private Instant returnedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ReservationStatus status = ReservationStatus.RESERVED;

    public Reservation() {}

    public Reservation(User rider, String bikeId, String stationId,
                       Instant reservedAt, Instant expiresAt, boolean active) {
        this.rider = rider;
        this.bikeId = bikeId;
        this.stationId = stationId;
        this.reservedAt = reservedAt;
        this.expiresAt = expiresAt;
        this.active = active;
    }
}
