package com.thinkvision.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import com.thinkvision.backend.entity.Bike;
import com.thinkvision.backend.entity.BikeStatus;
import java.time.Instant;


@Repository
public interface BikeRepository extends JpaRepository<Bike, String> {
    // Find all bikes at a station
    Optional<Bike> findByDock_Id(String dockId);

    List<Bike> findAllByStatusAndReservationExpiryBefore(BikeStatus status, Instant time);

    // Find available bikes at a station
    List<Bike> findByDock_Station_IdAndStatus(String stationId, BikeStatus status);

    // Find a bike by reservation id
//    Optional<Bike> findByReservationId(String reservationId);
}
