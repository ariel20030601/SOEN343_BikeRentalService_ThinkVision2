package com.thinkvision.backend.repository;

import com.thinkvision.backend.entity.Reservation;
import com.thinkvision.backend.entity.ReservationStatus;
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

    long countByRiderAndStatusAndReservedAtAfter(User rider, ReservationStatus status, Instant after);

    long countByRiderAndStatusAndReturnedAtBetween(User rider, ReservationStatus status, Instant from, Instant to);

    long countByRiderAndStatusAndReservedAtBetween(User rider, ReservationStatus status, Instant from, Instant to);

    long countByRiderAndStatusInAndReservedAtAfter(User rider, List<ReservationStatus> statuses, Instant after);

    List<Reservation> findByRider(User rider);

    Optional<Reservation> findFirstByRiderAndBikeIdAndStatus(User user, String bikeId, ReservationStatus reservationStatus);

    long countByRiderAndStatusAndReturnedAtAfter(User rider, ReservationStatus status, Instant after);
}


