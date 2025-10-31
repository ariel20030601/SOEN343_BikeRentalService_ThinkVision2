package com.thinkvision.backend.repository;

import com.thinkvision.backend.entity.Dock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

import com.thinkvision.backend.entity.DockStatus;
import com.thinkvision.backend.entity.Station;
import org.springframework.stereotype.Repository;

@Repository
public interface DockRepository extends JpaRepository<Dock, String> {

    Optional<Dock> findFirstByStation_IdAndStatus(String stationId, DockStatus status);

    // 🔹 Find all docks that belong to a specific station
    List<Dock> findByStation(Station station);

    long countByStation_IdAndStatus(String stationId, DockStatus status);

    // 🔹 Find all docks at a station that are NOT out of service
    List<Dock> findByStationAndStatusNot(Station station, DockStatus status);

    // 🔹 Find all docks that are out of service
    List<Dock> findByStatus(DockStatus status);

    // 🔹 Find docks with no bikes (for returns)
    @Query("SELECT d FROM Dock d WHERE d.bike IS NULL AND d.status <> 'OUT_OF_SERVICE'")
    List<Dock> findEmptyDocks();

    // 🔹 Find docks that currently have bikes (for checkouts)
    @Query("SELECT d FROM Dock d WHERE d.bike IS NOT NULL AND d.status <> 'OUT_OF_SERVICE'")
    List<Dock> findOccupiedDocks();

}

