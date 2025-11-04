package com.thinkvision.backend.applicationLayer.prc;

import com.thinkvision.backend.entity.Bike;
import com.thinkvision.backend.entity.BikeType;
import com.thinkvision.backend.entity.Trip;
import com.thinkvision.backend.repository.BikeRepository;
import com.thinkvision.backend.repository.TripRepository;
import com.thinkvision.backend.applicationLayer.dto.TripEndedEvent;
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
    private BikeRepository bikeRepo;

    private PricingPlan pricingPlan;

    @EventListener
    public void onTripEnded(TripEndedEvent event) {
        Optional<Trip> opt = tripRepo.findById(Long.toString(event.getTripId()));
        if (opt.isEmpty()) return;

        Trip trip = opt.get();
        if (trip.getStartTime() == null || trip.getEndTime() == null) return;

        long minutes = Math.max(1, Duration.between(trip.getStartTime(), trip.getEndTime()).toMinutes());

        Optional<Bike> bikeOptional = bikeRepo.findById(Long.toString(event.getTripId()));
        if (bikeOptional.isEmpty()) return;
        Bike bike = bikeOptional.get();
        pricingPlan = determinePricingPlan(bike);
        double cost = pricingPlan.getFare(minutes);

        // keep decoupled: for now compute and log; or forward to billing repo/service if present
        System.out.println("BillCalculator: tripId=" + trip.getId() + " minutes=" + minutes + " cost=" + cost);

        // Optionally publish another event or save a billing record here.
    }

    private PricingPlan determinePricingPlan(Bike bike) {
        BikeType bikeType = bike.getType();
        switch(bikeType)
        {
            case E_BIKE:
                return new EBikePlan();
            case STANDARD:
            default:
                return new StandardPlan();
        }
    }
}
