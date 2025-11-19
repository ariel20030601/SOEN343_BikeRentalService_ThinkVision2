// java
// File: src/main/java/com/thinkvision/backend/applicationLayer/bms/ReturnService.java
package com.thinkvision.backend.applicationLayer.bms;

import com.thinkvision.backend.applicationLayer.dto.EventPublisher;
import com.thinkvision.backend.applicationLayer.dto.TripEndedEvent;
import com.thinkvision.backend.applicationLayer.loyalty.LoyaltyService;
import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

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
    private ReservationRepository reservationRepository; // added

    @Autowired
    private EventPublisher eventPublisher;

    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    @Autowired
    private LoyaltyService loyaltyService;

    @Autowired
    private StationService stationService;

    public Trip returnBike(Integer userId, String stationId, String bikeId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        Trip trip = tripRepo.findFirstByRiderAndBikeIdAndActiveTrue(user, bikeId)
                .orElseThrow(() -> new IllegalStateException("No active trip found for user"));

        Dock dock = dockRepo.findFirstByStation_IdAndStatus(stationId, DockStatus.EMPTY)
                .orElseThrow(() -> new IllegalStateException("No available dock at this station"));

        trip.setEndStationId(stationId);
        trip.setEndTime(Instant.now());
        trip.setActive(false);
        tripRepo.save(trip);

        // Update Reservation record to RETURNED and set returnedAt (so loyalty queries see it)
        try {
            Optional<Reservation> optRes = reservationRepository.findFirstByRiderAndBikeIdAndStatus(user, trip.getBikeId(), ReservationStatus.CLAIMED);
            if (optRes.isPresent()) {
                Reservation res = optRes.get();
                res.setStatus(ReservationStatus.RETURNED);
                // set returnedAt if your entity has it; fallback to now
                res.setReturnedAt(Instant.now()); // ensure Reservation has this field
                reservationRepository.save(res);
                System.out.println("ReturnService: marked reservation id=" + res.getId() + " as RETURNED");
            } else {
                System.out.println("ReturnService: no matching CLAIMED reservation found for user=" + userId + " bike=" + bikeId);
            }
        } catch (Exception ex) {
            System.out.println("ReturnService: failed to update reservation: " + ex.getMessage());
            ex.printStackTrace(System.out);
        }

        Bike bike = bikeRepo.findById(trip.getBikeId())
                .orElseThrow(() -> new IllegalStateException("Bike not found"));

        bike.setStatus(BikeStatus.AVAILABLE);
        bike.setDock(dock);
        bikeRepo.save(bike);

        dock.setStatus(DockStatus.OCCUPIED);
        dockRepo.save(dock);

        stationService.updateOccupancy(stationId);

        eventPublisher.publish("TripEnded", trip.getId());
        applicationEventPublisher.publishEvent(new TripEndedEvent(trip.getId()));

        try {
            loyaltyService.evaluateAndApplyTier(user);
        } catch (Exception ex) {
            System.out.println("Failed to evaluate/apply loyalty tier for user " + userId + " after return: " + ex);
        }

        return trip;
    }
}
