package com.thinkvision.backend.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thinkvision.backend.entity.Reservation;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, String> {

    // Check if rider already has an active reservation
    boolean existsByRiderIdAndActiveTrue(String riderId);

    // Find one active reservation for a rider
    Optional<Reservation> findByRiderIdAndActiveTrue(String riderId);

    // Find all expired reservations (active=true but past expiry)
    List<Reservation> findByExpiresAtBeforeAndActiveTrue(Instant now);
}