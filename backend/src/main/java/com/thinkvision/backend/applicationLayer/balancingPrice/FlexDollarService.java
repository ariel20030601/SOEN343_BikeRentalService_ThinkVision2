package com.thinkvision.backend.applicationLayer.balancingPrice;

import com.thinkvision.backend.applicationLayer.dto.EventPublisher;
import com.thinkvision.backend.applicationLayer.dto.TripEndedEvent;
import com.thinkvision.backend.applicationLayer.dto.TripStartedEvent;
import com.thinkvision.backend.entity.Station;
import com.thinkvision.backend.entity.Trip;
import com.thinkvision.backend.entity.User;
import com.thinkvision.backend.repository.StationRepository;
import com.thinkvision.backend.repository.TripRepository;
import com.thinkvision.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FlexDollarService {

    @Autowired
    private StationRepository stationRepository;

    @Autowired
    private TripRepository tripRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private EventPublisher eventPublisher;

    @EventListener
    public void addFlexDollars(TripEndedEvent tripEndedEvent) {

        Optional<Trip> tripOpt = tripRepo.findById(tripEndedEvent.getTripId());
        if (tripOpt.isEmpty()) return;
        Trip trip = tripOpt.get();

        if (trip.getEndStationId() == null) return;
        Station endStation = stationRepository.findById(trip.getEndStationId()).orElse(null);
        if (endStation == null) return;

        if (trip.getRider() == null || trip.getRider().getId() == null) return;
        User user = userRepo.findById(trip.getRider().getId()).orElse(null);
        if (user == null) return;

        // -1 because bike has just been returned
        double threshold = endStation.getCapacity() * 0.25;
        if (endStation.getAvailableBikes() - 1 < threshold) {
            Double balance = user.getFlexBalance();
            if (balance == null) balance = 0.0;
            double newBalance = balance + 1.0;
            user.setFlexBalance(newBalance);
            userRepo.save(user);
            String msg = "FlexDollarService: awarded 1.0 flex to user id=" + user.getId() + " newBalance=" + newBalance;
            eventPublisher.publish("FlexDollar.Awarded", msg);
        }
    }

    @EventListener
    public void spendFlexDollars(TripStartedEvent tripStartedEvent) {
        Optional<Trip> tripOpt = tripRepo.findById(tripStartedEvent.getTripId());
        if (tripOpt.isEmpty()) return;
        Trip trip = tripOpt.get();

        if (trip.getRider() == null || trip.getRider().getId() == null) return;
        User user = userRepo.findById(trip.getRider().getId()).orElse(null);
        if (user == null) return;

        Double balance = user.getFlexBalance();
        if (balance == null) balance = 0.0;

        if (balance >= 1.0) {
            user.setFlexBalance(balance - 1.0);
            userRepo.save(user);

            try {
                trip.setFlexApplied(true);
                tripRepo.save(trip);
            } catch (Exception ex) {
                String err = "FlexDollarService: failed to mark trip flexApplied for tripId=" + trip.getId() + " : " + ex.getMessage();
                eventPublisher.publish("FlexDollar.MarkFail", err);
            }

            String msg = "FlexDollarService: spent 1.0 flex for user id=" + user.getId() + " newBalance=" + user.getFlexBalance();
            eventPublisher.publish("FlexDollar.Spent", msg);
        } else {
            String msg = "FlexDollarService: no flex to spend for user id=" + user.getId();
            eventPublisher.publish("FlexDollar.None", msg);
        }
    }

    public double getUserFlexBalance(Integer userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) return 0.0;
        User user = userOpt.get();
        Double balance = user.getFlexBalance();
        return balance != null ? balance : 0.0;
    }
}
