// java
package com.thinkvision.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import com.thinkvision.backend.entity.Bike;
import com.thinkvision.backend.entity.BikeStatus;

@Repository
public interface BikeRepository extends JpaRepository<Bike, String> {
    // find all bikes at a station
    List<Bike> findByStationId(String stationId);

    // find a bike by reservation id (useful to check if bike still tied to a reservation)
    Optional<Bike> findByReservationId(String reservationId);

    // optional convenience to find available bikes at a station
    List<Bike> findByStationIdAndStatus(String stationId, BikeStatus status);
}
