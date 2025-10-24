package com.thinkvision.backend.applicationLayer.bms;

import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DemoDataLoader implements CommandLineRunner {

    private final UserRepository userRepo;
    private final StationRepository stationRepo;
    private final DockRepository dockRepo;
    private final BikeRepository bikeRepo;

    public DemoDataLoader(
            UserRepository userRepo,
            StationRepository stationRepo,
            DockRepository dockRepo,
            BikeRepository bikeRepo) {
        this.userRepo = userRepo;
        this.stationRepo = stationRepo;
        this.dockRepo = dockRepo;
        this.bikeRepo = bikeRepo;
    }

    @Override
    public void run(String... args) {
        // Create demo users (1 rider + 1 operator)
        if (userRepo.findByUsername("demoRider").isEmpty()) {
            User rider = new User();
            rider.setFirstName("Demo");
            rider.setLastName("Rider");
            rider.setEmail("rider@example.com");
            rider.setUsername("demoRider");
            rider.setPasswordHash("password"); // placeholder
            rider.setRole("RIDER");
            rider.setAddress("123 Main St");
            userRepo.save(rider);
        }

        if (userRepo.findByUsername("demoOperator").isEmpty()) {
            User operator = new User();
            operator.setFirstName("Demo");
            operator.setLastName("Operator");
            operator.setEmail("operator@example.com");
            operator.setUsername("demoOperator");
            operator.setPasswordHash("password");
            operator.setRole("OPERATOR");
            operator.setAddress("456 Service Rd");
            userRepo.save(operator);
        }

        // Create station if not exists
        if (stationRepo.findById("S1").isEmpty()) {
            Station station = new Station();
            station.setId("S1");
            station.setCode("DOWNTOWN");
            station.setName("Downtown Station");
            station.setAddress("123 Main St");
            station.setCapacity(4);
            station.setAvailableBikes(0);
            station.setLatitude(45.5017);
            station.setLongitude(-73.5673);
            station.setStatus(StationStatus.EMPTY);
            station.setExpiresAfterMinutes(5);
            stationRepo.save(station);

            Dock dock1 = new Dock();
            dock1.setId("D1");
            dock1.setName("Dock 1");
            dock1.setStatus(DockStatus.OCCUPIED);
            dock1.setStation(station);
            dockRepo.save(dock1);

            Dock dock2 = new Dock();
            dock2.setId("D2");
            dock2.setName("Dock 2");
            dock2.setStatus(DockStatus.OCCUPIED);
            dock2.setStation(station);
            dockRepo.save(dock2);

            Dock dock3 = new Dock();
            dock3.setId("D3");
            dock3.setName("Dock 3");
            dock3.setStatus(DockStatus.EMPTY);
            dock3.setStation(station);
            dockRepo.save(dock3);

            Dock dock4 = new Dock();
            dock4.setId("D4");
            dock4.setName("Dock 4");
            dock4.setStatus(DockStatus.EMPTY);
            dock4.setStation(station);
            dockRepo.save(dock4);

            if (bikeRepo.findById("B5").isEmpty()) {
                Bike bike1 = new Bike();
                bike1.setId("B5");
                bike1.setStatus(BikeStatus.AVAILABLE);
                bike1.setType(BikeType.STANDARD);
                bike1.setDock(dock1);
                bikeRepo.save(bike1);

                dock1.setBike(bike1);
                dockRepo.save(dock1);
            }

            if (bikeRepo.findById("B6").isEmpty()) {
                Bike bike2 = new Bike();
                bike2.setId("B6");
                bike2.setStatus(BikeStatus.AVAILABLE);
                bike2.setType(BikeType.E_BIKE);
                bike2.setDock(dock2);
                bikeRepo.save(bike2);

                dock2.setBike(bike2);
                dockRepo.save(dock2);
            }

            // Update station occupancy
            int available = 2;
            station.setAvailableBikes(available);
            station.setStatus(available == 0 ? StationStatus.EMPTY :
                    (available < station.getCapacity() ? StationStatus.OCCUPIED : StationStatus.FULL));
            stationRepo.save(station);

            System.out.println("Demo station S1 initialized with 2 bikes and 4 docks.");
        }
    }
}
