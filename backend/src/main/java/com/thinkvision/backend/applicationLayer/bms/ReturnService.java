package com.thinkvision.backend.applicationLayer.bms;

import com.thinkvision.backend.applicationLayer.dto.EventPublisher;
import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ReturnService {

    @Autowired
    private TripRepository tripRepo;

    @Autowired
    private DockRepository dockRepo;

    @Autowired
    private BikeRepository bikeRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private EventPublisher eventPublisher;

    @Autowired
    private StationService stationService;

    public Trip returnBike(Integer userId, String stationId, String bikeId) {
        // Step 1: Validate user
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        // Step 2: Find active trip for this user + bike
        Trip trip = tripRepo.findFirstByRiderAndBikeIdAndActiveTrue(user, bikeId)
                .orElseThrow(() -> new IllegalStateException("No active trip found for user"));

        // Step 3: Find an available dock at that station
        Dock dock = dockRepo.findFirstByStation_IdAndStatus(stationId, DockStatus.EMPTY)
                .orElseThrow(() -> new IllegalStateException("No available dock at this station"));

        // Step 4: End trip
        trip.setEndStationId(stationId);
        trip.setEndTime(Instant.now());
        trip.setActive(false);
        tripRepo.save(trip);

        // Step 5: Update bike + dock
        Bike bike = bikeRepo.findById(trip.getBikeId())
                .orElseThrow(() -> new IllegalStateException("Bike not found"));

        bike.setStatus(BikeStatus.AVAILABLE);
        bike.setDock(dock);
        bikeRepo.save(bike);

        dock.setStatus(DockStatus.OCCUPIED);
        dockRepo.save(dock);

        // Step 6: Update station occupancy
        stationService.updateOccupancy(stationId);

        eventPublisher.publish("TripEnded", trip.getId());
        return trip;
    }
}
