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
    private final PasswordEncoder passwordEncoder;

    public DemoDataLoader(
            UserRepository userRepo,
            StationRepository stationRepo,
            DockRepository dockRepo,
            BikeRepository bikeRepo,
            PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.stationRepo = stationRepo;
        this.dockRepo = dockRepo;
        this.bikeRepo = bikeRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        createDemoUsers();
        createStation1();
        createStation2();
        createStation3();
    }

    private void createDemoUsers() {
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
    }

    // ===============================
    // STATION 1 - Concordia SGW
    // ===============================
    private void createStation1() {
        if (stationRepo.existsById("S1")) return;

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

        // build docks + bikes in memory, then save station once
        for (int i = 1; i <= s1.getCapacity(); i++) {
            Dock dock = new Dock();
            dock.setId("S1D" + i);
            dock.setName("Dock " + i);
            dock.setStation(s1);       // set parent
            s1.getDocks().add(dock);   // keep bidirectional in sync

            if (i <= 13) {
                dock.setStatus(DockStatus.OCCUPIED);

                Bike bike = new Bike();
                bike.setId("S1B" + i);
                bike.setStatus(BikeStatus.AVAILABLE);
                bike.setType(BikeType.STANDARD);

                bike.setDock(dock);    // owning side
                dock.setBike(bike);    // inverse side
            } else {
                dock.setStatus(DockStatus.EMPTY);
            }
        }

        // cascade Station -> Docks -> Bikes
        stationRepo.save(s1);

        System.out.println("Loaded Station 1 (SGW) with 13 bikes and 10 empty docks.");
    }

    // ===============================
    // STATION 2 - Loyola
    // ===============================
    private void createStation2() {
        if (stationRepo.existsById("S2")) return;

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

        for (int i = 1; i <= s2.getCapacity(); i++) {
            Dock dock = new Dock();
            dock.setId("S2D" + i);
            dock.setName("Dock " + i);
            dock.setStatus(DockStatus.OCCUPIED);
            dock.setStation(s2);
            s2.getDocks().add(dock);

            Bike bike = new Bike();
            bike.setId("S2B" + i);
            bike.setStatus(BikeStatus.AVAILABLE);
            bike.setType(i <= 10 ? BikeType.STANDARD : BikeType.E_BIKE);

            bike.setDock(dock);
            dock.setBike(bike);
        }

        stationRepo.save(s2);

        System.out.println("Loaded Station 2 (Loyola) with 15 bikes (10 standard, 5 e-bikes).");
    }

    // ===============================
    // STATION 3 - Complexe Desjardins
    // ===============================
    private void createStation3() {
        if (stationRepo.existsById("S3")) return;

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

        for (int i = 1; i <= s3.getCapacity(); i++) {
            Dock dock = new Dock();
            dock.setId("S3D" + i);
            dock.setName("Dock " + i);
            dock.setStation(s3);
            s3.getDocks().add(dock);

            if (i <= 3) {
                dock.setStatus(DockStatus.OCCUPIED);

                Bike bike = new Bike();
                bike.setId("S3B" + i);
                bike.setStatus(BikeStatus.AVAILABLE);
                bike.setType(BikeType.STANDARD);

                bike.setDock(dock);
                dock.setBike(bike);
            } else {
                dock.setStatus(DockStatus.EMPTY);
            }
        }

        stationRepo.save(s3);

        System.out.println("Loaded Station 3 (Desjardins) with 3 bikes and 17 empty docks.");
    }

    @Transactional
    public void reloadDemoData() {
        System.out.println("Resetting BikeShare system to demo baseline...");

        bikeRepo.deleteAll();
        dockRepo.deleteAll();
        stationRepo.deleteAll();

        // varargs, so this is fine
        run();

        System.out.println("Demo data reloaded successfully.");
    }
}
