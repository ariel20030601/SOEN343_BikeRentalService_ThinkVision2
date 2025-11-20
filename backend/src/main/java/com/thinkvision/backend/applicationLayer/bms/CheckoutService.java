package com.thinkvision.backend.applicationLayer.bms;

import com.thinkvision.backend.applicationLayer.dto.EventPublisher;
import com.thinkvision.backend.applicationLayer.dto.TripStartedEvent;
import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class CheckoutService {

    @Autowired
    private ReservationRepository reservationRepo;

    @Autowired
    private TripRepository tripRepo;

    @Autowired
    private BikeRepository bikeRepo;

    @Autowired
    private DockRepository dockRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private EventPublisher eventPublisher;

    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    @Autowired
    private StationService stationService;

    public Trip checkoutBike(Integer userId, String stationId, String bikeId) {
        // Step 1: Find user
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        // Step 2: Find bike + dock
        Bike bike = bikeRepo.findById(bikeId)
                .orElseThrow(() -> new IllegalStateException("Bike not found"));

        Dock dock = bike.getDock();
        if (dock == null)
            throw new IllegalStateException("Bike is not currently docked");

        if (dock.getStatus() == DockStatus.OUT_OF_SERVICE)
            throw new IllegalStateException("Dock is out of service");

        // Step 3: Check reservation
        Optional<Reservation> reservationOpt = reservationRepo.findByRiderAndActiveTrue(user);
        if (reservationOpt.isPresent()) {
            Reservation res = reservationOpt.get();
            if (res.getExpiresAt().isBefore(Instant.now())) {
                res.setActive(false);
                reservationRepo.save(res);
                throw new IllegalStateException("Reservation expired");
            }
            res.setActive(false);
            reservationRepo.save(res);
        }

        // Step 4: Create trip
        Trip trip = new Trip();
        trip.setRider(user);
        trip.setBikeId(bike.getId());
        trip.setStartStationId(dock.getStation().getId());
        trip.setStartTime(Instant.now());
        trip.setActive(true);
        tripRepo.save(trip);

        // Step 5: Update bike + dock
        bike.setStatus(BikeStatus.ON_TRIP);
        bike.setDock(null);
        bikeRepo.save(bike);

        dock.setStatus(DockStatus.EMPTY);
        dockRepo.save(dock);

        // Step 6: Update station occupancy
        stationService.updateOccupancy(stationId);

        applicationEventPublisher.publishEvent(new TripStartedEvent(trip.getId()));

        eventPublisher.publish("TripStarted", trip.getId());
        return trip;
    }
}
