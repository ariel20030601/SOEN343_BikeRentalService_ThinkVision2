package com.thinkvision.backend.applicationLayer.balancingPrice;

import com.thinkvision.backend.applicationLayer.dto.TripEndedEvent;
import com.thinkvision.backend.entity.Station;
import com.thinkvision.backend.entity.Trip;
import com.thinkvision.backend.entity.User;
import com.thinkvision.backend.repository.StationRepository;
import com.thinkvision.backend.repository.TripRepository;
import com.thinkvision.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;

import java.util.Optional;

public class FlexDollarService {

    @Autowired
    private StationRepository stationRepository;

    @Autowired
    private TripRepository tripRepo;

    @Autowired
    private UserRepository userRepo;

    @EventListener
    public void addFlexDollars(TripEndedEvent tripEndedEvent) {

        Optional<Trip> tripOpt = tripRepo.findById(tripEndedEvent.getTripId());
        if (tripOpt.isEmpty()) return;
        Trip trip = tripOpt.get();

        Station endStation = stationRepository.findById(trip.getEndStationId()).orElse(null);
        if (endStation == null) return;

        User user = userRepo.findById(trip.getRider().getId()).orElse(null);
        if (user == null) return;

        // -1 because bike has just been returned
        if (endStation.getAvailableBikes() - 1 < endStation.getCapacity() * 0.25) {
            user.setFlexBalance(user.getFlexBalance() + 1.0);
            userRepo.save(user);
        }
    }

    @EventListener
    public void spendFlexDollars(TripEndedEvent tripEndedEvent) {
        Optional<Trip> tripOpt = tripRepo.findById(tripEndedEvent.getTripId());
        if (tripOpt.isEmpty()) return;
        Trip trip = tripOpt.get();

        User user = userRepo.findById(trip.getRider().getId()).orElse(null);
        if (user == null) return;

        if (user.getFlexBalance() != 0) {
            user.setFlexBalance(user.getFlexBalance() - 1.0);
            userRepo.save(user);
        }
    }
}
