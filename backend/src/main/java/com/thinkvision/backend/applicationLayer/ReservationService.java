package com.thinkvision.backend.applicationLayer;

import com.thinkvision.backend.applicationLayer.dto.EventPublisher;
import com.thinkvision.backend.repository.*;
import com.thinkvision.backend.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ReservationService {

    @Autowired
    BikeRepository bikeRepo;
    @Autowired
    DockRepository dockRepo;
    @Autowired
    ReservationRepository reservationRepo;
    @Autowired
    EventPublisher eventPublisher;
    @Autowired
    RiderRepository riderRepo;

    public Reservation reserveBike(String riderId, Long stationId, String bikeId) {
        // Check if rider exists
        Rider rider = riderRepo.findById(riderId).orElseThrow();
        if (reservationRepo.existsByRiderIdAndActiveTrue(riderId))
            throw new IllegalStateException("Rider already has an active reservation");

        // Validate dock
        Dock dock = dockRepo.findById(stationId)
                .orElseThrow(() -> new IllegalStateException("Dock not found"));
        if (dock.isOutOfService() || dock.getAvailableBikes() == 0)
            throw new IllegalStateException("Dock unavailable");

        // Validate bike
        Bike bike = bikeRepo.findById(bikeId)
                .orElseThrow(() -> new IllegalStateException("Bike not found"));
        if (bike.getStatus() != BikeStatus.AVAILABLE)
            throw new IllegalStateException("Bike not available");

        // Reserve bike
        bike.setStatus(BikeStatus.RESERVED);
        dock.setAvailableBikes(dock.getAvailableBikes() - 1);
        bikeRepo.save(bike);
        dockRepo.save(dock);

        // Create reservation
        Reservation res = new Reservation();
        res.setBikeId(bikeId);
        res.setRiderId(riderId);
        res.setStationId(stationId.toString());
        res.setReservedAt(Instant.now());
        res.setExpiresAt(Instant.now().plusSeconds(5 * 60)); // 5 minutes
        res.setActive(true);

        reservationRepo.save(res);
        eventPublisher.publish("BikeReserved", res.getId());

        return res;
    }

    @Scheduled(fixedRate = 60000)
    public void expireReservations() {
        List<Reservation> active = reservationRepo
                .findByExpiresAtBeforeAndActiveTrue(Instant.now());

        for (Reservation r : active) {
            r.setActive(false);

            Bike bike = bikeRepo.findById(r.getBikeId())
                    .orElseThrow(() -> new IllegalStateException("Bike not found"));
            Dock dock = dockRepo.findById(Long.valueOf(r.getStationId()))
                    .orElseThrow(() -> new IllegalStateException("Dock not found"));

            bike.setStatus(BikeStatus.AVAILABLE);
            dock.setAvailableBikes(dock.getAvailableBikes() + 1);

            bikeRepo.save(bike);
            dockRepo.save(dock);
            reservationRepo.save(r);

            eventPublisher.publish("ReservationExpired", r.getId());
        }
    }
}
