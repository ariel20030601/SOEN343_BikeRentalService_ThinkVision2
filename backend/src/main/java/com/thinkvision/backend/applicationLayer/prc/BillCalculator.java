package com.thinkvision.backend.applicationLayer.prc;

import com.thinkvision.backend.applicationLayer.dto.BillComputedEvent;
import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.BikeRepository;
import com.thinkvision.backend.repository.StationRepository;
import com.thinkvision.backend.repository.TripRepository;
import com.thinkvision.backend.applicationLayer.dto.TripEndedEvent;
import com.thinkvision.backend.repository.TripReceiptRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Duration;
import java.util.Optional;

@Service
public class BillCalculator {

    @Autowired
    private TripRepository tripRepo;

    @Autowired
    private TripReceiptRepository tripReceiptRepo;

    @Autowired
    private StationRepository stationRepo;

    @Autowired
    private BikeRepository bikeRepo;

    private ApplicationEventPublisher applicationEventPublisher;

    @EventListener
    public void computeCost(TripEndedEvent event) {
        Optional<Trip> opt = tripRepo.findById(Long.toString(event.getTripId()));
        if (opt.isEmpty()) return;

        Trip trip = opt.get();
        if (trip.getStartTime() == null || trip.getEndTime() == null) return;

        long minutes = Math.max(1, Duration.between(trip.getStartTime(), trip.getEndTime()).toMinutes());

        Optional<Bike> bikeOptional = bikeRepo.findById(trip.getBikeId());
        if (bikeOptional.isEmpty()) return;
        Bike bike = bikeOptional.get();
        PricingPlan pricingPlan = determinePricingPlan(bike);
        double cost = pricingPlan.getFare(minutes);

        // publish cost computed event for trip summary
        applicationEventPublisher.publishEvent(new BillComputedEvent(trip, bike, cost));

        // keep decoupled: for now compute and log; or forward to billing repo/service if present
        System.out.println("BillCalculator: tripId=" + trip.getId() + " minutes=" + minutes + " cost=" + cost);

        Station startStation = stationRepo.findById(trip.getStartStationId()).orElse(null);
        Station endStation = stationRepo.findById(trip.getEndStationId()).orElse(null);

        // save a billing record here.
        assert startStation != null;
        tripReceiptRepo.save(new TripReceipt(trip.getId(),trip.getRider().getId(), trip.getStartTime(), trip.getEndTime(),
                bike.getId(), startStation.getName(), endStation.getName(), cost));
    }

    private PricingPlan determinePricingPlan(Bike bike) {
        BikeType bikeType = bike.getType();
        if(bikeType == BikeType.E_BIKE) return new EBikePlan();
        else return new StandardPlan();
    }
}
