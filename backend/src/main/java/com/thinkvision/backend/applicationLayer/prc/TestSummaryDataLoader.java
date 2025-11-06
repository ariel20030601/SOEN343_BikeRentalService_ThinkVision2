// java
package com.thinkvision.backend.applicationLayer.prc;

import com.thinkvision.backend.applicationLayer.dto.BillComputedEvent;
import com.thinkvision.backend.entity.Bike;
import com.thinkvision.backend.entity.Station;
import com.thinkvision.backend.entity.Trip;
import com.thinkvision.backend.entity.TripReceipt;
import com.thinkvision.backend.entity.User;
import com.thinkvision.backend.repository.BikeRepository;
import com.thinkvision.backend.repository.StationRepository;
import com.thinkvision.backend.repository.TripReceiptRepository;
import com.thinkvision.backend.repository.TripRepository;
import com.thinkvision.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Component
public class TestSummaryDataLoader implements CommandLineRunner {

    private final UserRepository userRepo;
    private final BikeRepository bikeRepo;
    private final StationRepository stationRepo;
    private final TripRepository tripRepo;
    private final TripReceiptRepository tripReceiptRepo;
    private final ApplicationEventPublisher eventPublisher;

    public TestSummaryDataLoader(UserRepository userRepo,
                                 BikeRepository bikeRepo,
                                 StationRepository stationRepo,
                                 TripRepository tripRepo,
                                 TripReceiptRepository tripReceiptRepo,
                                 ApplicationEventPublisher eventPublisher) {
        this.userRepo = userRepo;
        this.bikeRepo = bikeRepo;
        this.stationRepo = stationRepo;
        this.tripRepo = tripRepo;
        this.tripReceiptRepo = tripReceiptRepo;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public void run(String... args) {
        if (tripRepo.count() > 0) {
            System.out.println("Skipping test trip creation: trips already exist.");
            return;
        }

        Optional<User> riderOpt = userRepo.findByUsername("demoRider");
        Optional<Bike> bikeOpt = bikeRepo.findById("B5");
        Optional<Station> stationOpt = stationRepo.findById("S1");

        if (riderOpt.isEmpty() || bikeOpt.isEmpty() || stationOpt.isEmpty()) {
            System.out.println("Cannot create test trip: ensure demoRider, bike B5 and station S1 exist.");
            return;
        }

        User rider = riderOpt.get();
        Bike bike = bikeOpt.get();
        Station station = stationOpt.get();

        Instant end = Instant.now();
        Instant start = end.minus(Duration.ofMinutes(15));

        Trip trip = new Trip();
        trip.setRider(rider);
        trip.setBikeId(bike.getId());
        trip.setStartStationId(station.getId());
        trip.setEndStationId(station.getId());
        trip.setStartTime(start);
        trip.setEndTime(end);
        trip.setActive(false);

        Trip saved = tripRepo.save(trip);

        double fare = 3.50;

        TripReceipt receipt = new TripReceipt(
                saved.getId(),
                rider.getId(),
                saved.getStartTime(),
                saved.getEndTime(),
                bike.getId(),
                saved.getStartStationId(),
                saved.getEndStationId(),
                fare
        );
        tripReceiptRepo.save(receipt);

        // publish BillComputedEvent so SummaryService builds the summary cache
        eventPublisher.publishEvent(new BillComputedEvent(saved, bike, fare));

        System.out.println("Test trip created. Use GET /api/prc/summary?tripId=" + saved.getId());
    }
}