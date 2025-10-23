package com.thinkvision.backend.repository;

import com.thinkvision.backend.entity.Dock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface DockRepository extends JpaRepository<Dock, Long> {

    // Find all docks that are not out of service
    List<Dock> findByOutOfServiceFalse();

    // Find docks with available bikes
    @Query("SELECT d FROM Dock d WHERE d.availableBikes > 0 AND d.outOfService = false")
    List<Dock> findDocksWithAvailableBikes();

    // Find docks with free space (for returns)
    @Query("SELECT d FROM Dock d WHERE d.availableBikes < d.capacity AND d.outOfService = false")
    List<Dock> findDocksWithFreeSpace();
}
