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
    private UserRepository userRepo;

    @Autowired
    private StationService stationService;

    private static final int EXPIRES_AFTER_MINUTES = 5;

    public Reservation reserveBike(Integer userId, String stationId, String bikeId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        if (reservationRepo.existsByRiderAndActiveTrue(user)) {
            throw new IllegalStateException("User already has an active reservation");
        }

        Bike bike = bikeRepo.findById(bikeId)
                .orElseThrow(() -> new IllegalStateException("Bike not found"));

        Dock dock = bike.getDock();
        if (dock == null)
            throw new IllegalStateException("Bike is not currently docked");

        if (dock.getStatus() == DockStatus.OUT_OF_SERVICE)
            throw new IllegalStateException("Dock is out of service");

        if (bike.getStatus() != BikeStatus.AVAILABLE)
            throw new IllegalStateException("Bike is not available");

        // 🔹 Mark reserved
        bike.setStatus(BikeStatus.RESERVED);
        bike.setReservationExpiry(Instant.now().plusSeconds(EXPIRES_AFTER_MINUTES * 60));
        bikeRepo.save(bike);

        // 🔹 Create reservation
        Reservation res = new Reservation(
                user,
                bikeId,
                dock.getStation().getId(),
                Instant.now(),
                bike.getReservationExpiry(),
                true
        );
        reservationRepo.save(res);

        eventPublisher.publish("BikeReserved", res.getId());
        return res;
    }

    // Scheduled job: run every 60 seconds
    @Scheduled(fixedRate = 60000)
    public void expireReservations() {
        Instant now = Instant.now();

        List<Bike> expiredBikes = bikeRepo.findAllByStatusAndReservationExpiryBefore(
                BikeStatus.RESERVED, now
        );

        for (Bike bike : expiredBikes) {
            // Find associated reservation
            Reservation res = reservationRepo.findByBikeIdAndActiveTrue(bike.getId()).orElse(null);
            if (res != null) {
                res.setActive(false);
                reservationRepo.save(res);
            }

            // Free bike + dock
            bike.setStatus(BikeStatus.AVAILABLE);
            bike.setReservationExpiry(null);
            bikeRepo.save(bike);

            String stationId = bike.getDock() != null ? bike.getDock().getStation().getId() : null;
            if (stationId != null) {
                stationService.updateOccupancy(stationId);
            }

            eventPublisher.publish("ReservationExpired", bike.getId());
        }

        if (!expiredBikes.isEmpty()) {
            System.out.println("Expired " + expiredBikes.size() + " reservations");
        }
    }
}