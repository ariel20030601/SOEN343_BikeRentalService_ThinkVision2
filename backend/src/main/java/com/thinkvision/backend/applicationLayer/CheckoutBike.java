package com.thinkvision.backend.applicationLayer;
import com.thinkvision.backend.applicationLayer.dto.EventPublisher;
import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.thinkvision.backend.repository.TripRepository;

import java.time.Instant;

@Service
public class CheckoutBike
{


    BikeRepository bikeRepo;
    DockRepository dockRepo;
    ReservationRepository reservationRepo;
    EventPublisher eventPublisher;
    RiderRepository riderRepo;
    TripRepository tripRepo;

    public void checkoutBike(String riderId, Long stationId, String bikeId) {
        // Check if rider exists
        riderRepo.findById(riderId).orElseThrow();

        // Validate reservation
        Reservation reservation = reservationRepo.findByRiderIdAndActiveTrue(riderId)
                .orElseThrow(() -> new IllegalStateException("No active reservation found for this rider and bike"));

        // Validate bike
        Bike bike = bikeRepo.findById(bikeId)
                .orElseThrow(() -> new IllegalStateException("Bike not found"));
        if (bike.getStatus() != BikeStatus.RESERVED)
            throw new IllegalStateException("Bike is not reserved");

        // Validate dock
        Dock dock = dockRepo.findById(stationId)
                .orElseThrow(() -> new IllegalStateException("Dock not found"));

        if (dock.isOutOfService() || dock.getAvailableBikes() <= 0){
            throw new IllegalStateException("Dock unavailable");
        }

        // Checkout bike
        bike.setStatus(BikeStatus.CHECKED_OUT);
        bikeRepo.save(bike);

        // Update dock
        dock.setAvailableBikes(dock.getAvailableBikes() - 1);
        dockRepo.save(dock);

        // Update reservation
        reservation.setActive(false);
        reservationRepo.save(reservation);

        // Create Trip
        createTrip(riderId, bikeId, stationId);

        // Publish event
        eventPublisher.publish("BikeCheckedOut", bike.getId());
    }

    private void createTrip(String riderId, String bikeId, Long stationId) {
        Trip trip = new Trip();
        trip.setRiderId(riderId);
        trip.setBikeId(bikeId);
        trip.setStartStationId(stationId.toString());
        trip.setStartTime(Instant.now());
        trip.setActive(true);
        tripRepo.save(trip);
    }

}
