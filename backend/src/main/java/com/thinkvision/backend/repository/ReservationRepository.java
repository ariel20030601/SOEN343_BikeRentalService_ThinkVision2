package com.thinkvision.backend.repository;

import com.thinkvision.backend.entity.Reservation;
import com.thinkvision.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, String> {

    // check if rider already has an active reservation
    boolean existsByRiderAndActiveTrue(User rider);

    // find one active reservation for a given user
    Optional<Reservation> findByRiderAndActiveTrue(User rider);

    // find all active reservations that have expired
    List<Reservation> findByExpiresAtBeforeAndActiveTrue(Instant now);
    Optional<Reservation> findByBikeIdAndActiveTrue(String bikeId);
}

