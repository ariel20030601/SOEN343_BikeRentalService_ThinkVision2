package com.thinkvision.backend.applicationLayer.bms;

import com.thinkvision.backend.applicationLayer.dto.EventPublisher;
import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private BikeRepository bikeRepo;

    @Autowired
    private DockRepository dockRepo;

    @Autowired
    private ReservationRepository reservationRepo;

    @Autowired
    private EventPublisher eventPublisher;

    @Autowired
    private UserRepository userRepo; // was RiderRepository before

    public Reservation reserveBike(Integer userId, String stationId, String bikeId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        if (reservationRepo.existsByRiderAndActiveTrue(user)) {
            throw new IllegalStateException("User already has an active reservation");
        }

        // Find the bike and its dock
        Bike bike = bikeRepo.findById(bikeId)
                .orElseThrow(() -> new IllegalStateException("Bike not found"));

        Dock dock = bike.getDock();
        if (dock == null) {
            throw new IllegalStateException("Bike is not currently docked");
        }

        if (dock.getStatus() == DockStatus.OUT_OF_SERVICE)
            throw new IllegalStateException("Dock is out of service");

        if (bike.getStatus() != BikeStatus.AVAILABLE)
            throw new IllegalStateException("Bike is not available");

        // 🔹 Mark reserved
        bike.setStatus(BikeStatus.RESERVED);
        bikeRepo.save(bike);

        // 🔹 Create reservation
        Reservation res = new Reservation(
                user,
                bikeId,
                dock.getStation().getId(),
                Instant.now(),
                Instant.now().plusSeconds(5 * 60),
                true
        );
        reservationRepo.save(res);

        eventPublisher.publish("BikeReserved", res.getId());
        return res;
    }

}
