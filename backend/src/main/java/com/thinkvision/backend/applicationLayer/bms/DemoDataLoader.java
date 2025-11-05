package com.thinkvision.backend.applicationLayer.bms;

import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DemoDataLoader implements CommandLineRunner {

    private final UserRepository userRepo;
    private final StationRepository stationRepo;
    private final DockRepository dockRepo;
    private final BikeRepository bikeRepo;
    private PasswordEncoder passwordEncoder;

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
    @Transactional
    public void run(String... args) {
        // Create demo users
        if (userRepo.findByUsername("demoRider").isEmpty()) {
            User rider = new User();
            rider.setFirstName("Demo");
            rider.setLastName("Rider");
            rider.setEmail("rider@example.com");
            rider.setUsername("demoRider");
            rider.setPasswordHash(passwordEncoder.encode("password"));
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
            operator.setPasswordHash(passwordEncoder.encode("password"));
            operator.setRole("OPERATOR");
            operator.setAddress("456 Service Rd");
            userRepo.save(operator);
        }

        // ===============================
        // STATION 1 - Concordia SGW
        // ===============================
        if (stationRepo.findById("S1").isEmpty()) {
            Station s1 = new Station();
            s1.setId("S1");
            s1.setCode("STATION1");
            s1.setName("Station 1");
            s1.setAddress("Concordia University SGW Campus");
            s1.setLatitude(45.4948);
            s1.setLongitude(-73.5779);
            s1.setCapacity(23);
            s1.setAvailableBikes(13);
            s1.setFreeDocks(10);
            s1.setStatus(StationStatus.OCCUPIED);
            s1.setExpiresAfterMinutes(5);
            stationRepo.save(s1);

            // Add docks
            for (int i = 1; i <= s1.getCapacity(); i++) {
                Dock dock = new Dock();
                dock.setId("S1D" + i);
                dock.setName("Dock " + i);
                dock.setStatus(i <= 13 ? DockStatus.OCCUPIED : DockStatus.EMPTY);
                dock.setStation(s1);
                dockRepo.save(dock);

                if (i <= 13) {
                    Bike bike = new Bike();
                    bike.setId("S1B" + i);
                    bike.setStatus(BikeStatus.AVAILABLE);
                    bike.setType(BikeType.STANDARD);
                    bike.setDock(dock);
                    bikeRepo.save(bike);
                    dock.setBike(bike);
                    dockRepo.save(dock);
                }
            }

            stationRepo.save(s1);
            System.out.println("Loaded Station 1 (SGW) with 13 bikes and 10 empty docks.");
        }

        // ===============================
        // STATION 2 - Loyola
        // ===============================
        if (stationRepo.findById("S2").isEmpty()) {
            Station s2 = new Station();
            s2.setId("S2");
            s2.setCode("STATION2");
            s2.setName("Station 2");
            s2.setAddress("Concordia University Loyola Campus");
            s2.setLatitude(45.4581);
            s2.setLongitude(-73.6391);
            s2.setCapacity(15);
            s2.setAvailableBikes(15);
            s2.setFreeDocks(0);
            s2.setStatus(StationStatus.FULL);
            s2.setExpiresAfterMinutes(5);
            stationRepo.save(s2);

            // Add docks
            for (int i = 1; i <= s2.getCapacity(); i++) {
                Dock dock = new Dock();
                dock.setId("S2D" + i);
                dock.setName("Dock " + i);
                dock.setStatus(DockStatus.OCCUPIED);
                dock.setStation(s2);
                dockRepo.save(dock);

                Bike bike = new Bike();
                bike.setId("S2B" + i);
                bike.setStatus(BikeStatus.AVAILABLE);
                // first 10 are standard, last 5 are e-bikes
                bike.setType(i <= 10 ? BikeType.STANDARD : BikeType.E_BIKE);
                bike.setDock(dock);
                bikeRepo.save(bike);

                dock.setBike(bike);
                dockRepo.save(dock);
            }

            stationRepo.save(s2);
            System.out.println("Loaded Station 2 (Loyola) with 15 bikes (10 standard, 5 e-bikes).");
        }

        // ===============================
        // STATION 3 - Complexe Desjardins
        // ===============================
        if (stationRepo.findById("S3").isEmpty()) {
            Station s3 = new Station();
            s3.setId("S3");
            s3.setCode("STATION3");
            s3.setName("Station 3");
            s3.setAddress("Complexe Desjardins");
            s3.setLatitude(45.5075);
            s3.setLongitude(-73.5643);
            s3.setCapacity(20);
            s3.setAvailableBikes(3);
            s3.setFreeDocks(17);
            s3.setStatus(StationStatus.OCCUPIED);
            s3.setExpiresAfterMinutes(5);
            stationRepo.save(s3);

            // Add docks
            for (int i = 1; i <= s3.getCapacity(); i++) {
                Dock dock = new Dock();
                dock.setId("S3D" + i);
                dock.setName("Dock " + i);
                dock.setStatus(i <= 3 ? DockStatus.OCCUPIED : DockStatus.EMPTY);
                dock.setStation(s3);
                dockRepo.save(dock);

                if (i <= 3) {
                    Bike bike = new Bike();
                    bike.setId("S3B" + i);
                    bike.setStatus(BikeStatus.AVAILABLE);
                    bike.setType(BikeType.STANDARD);
                    bike.setDock(dock);
                    bikeRepo.save(bike);
                    dock.setBike(bike);
                    dockRepo.save(dock);
                }
            }

            stationRepo.save(s3);
            System.out.println("Loaded Station 3 (Desjardins) with 3 bikes and 17 empty docks.");
        }
    }

    @Transactional
    public void reloadDemoData() {
        System.out.println("Resetting BikeShare system to demo baseline...");

        dockRepo.deleteAll();
        bikeRepo.deleteAll();
        stationRepo.deleteAll();

        // Recreate baseline state
        run();

        System.out.println("Demo data reloaded successfully.");
    }
}


