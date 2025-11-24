package com.thinkvision.backend.applicationLayer.bms;

import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.stream.IntStream;
import java.util.Optional;

@Component
public class DemoDataLoader implements CommandLineRunner {

    private final UserRepository userRepo;
    private final StationRepository stationRepo;
    private final DockRepository dockRepo;
    private final BikeRepository bikeRepo;
    private final ReservationRepository reservationRepo;
    private final TripRepository tripRepo;
    private final PasswordEncoder passwordEncoder;

    public DemoDataLoader(
            UserRepository userRepo,
            StationRepository stationRepo,
            DockRepository dockRepo,
            BikeRepository bikeRepo,
            ReservationRepository reservationRepo,
            TripRepository tripRepo,
            PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.stationRepo = stationRepo;
        this.dockRepo = dockRepo;
        this.bikeRepo = bikeRepo;
        this.reservationRepo = reservationRepo;
        this.tripRepo = tripRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        createDemoUsers();
        createLoyaltyEdgeUsers();
        createStation1();
        createStation2();
        createStation3();
    }

    // Helper: find by email first, then username
    private Optional<User> findUserByEmailOrUsername(String email, String username) {
        if (email != null) {
            Optional<User> byEmail = userRepo.findByEmail(email);
            if (byEmail.isPresent()) return byEmail;
        }
        if (username != null) {
            return userRepo.findByUsername(username);
        }
        return Optional.empty();
    }

    private User createUserIfMissing(String email, String username,
                                     String firstName, String lastName,
                                     String role, String address, LoyaltyTier tier) {
        Optional<User> existing = findUserByEmailOrUsername(email, username);
        if (existing.isPresent()) {
            return existing.get();
        }

        User u = new User();
        u.setFirstName(firstName);
        u.setLastName(lastName);
        u.setEmail(email);
        u.setUsername(username);
        u.setPasswordHash(passwordEncoder.encode("password"));
        u.setRole(role);
        u.setAddress(address);
        if (tier != null) u.setLoyaltyTier(tier);
        userRepo.save(u);
        return u;
    }

    private void createDemoUsers() {
        createUserIfMissing("rider@example.com", "demoRider", "Demo", "Rider", "RIDER", "123 Main St", null);
        createUserIfMissing("operator@example.com", "demoOperator", "Demo", "Operator", "OPERATOR", "456 Service Rd", null);
    }

    private void createLoyaltyEdgeUsers() {
        // nearBronze / almost bronze (email/username tuned)
        String nearBronzeEmail = "nearbronze@example.com";
        String nearBronzeUsername = "nearBronze";
        Optional<User> maybeNearBronze = findUserByEmailOrUsername(nearBronzeEmail, nearBronzeUsername);
        if (maybeNearBronze.isEmpty()) {
            User u = createUserIfMissing(nearBronzeEmail, nearBronzeUsername, "None", "AlmostBronze", "RIDER", "1 Demo Ln", null);
            Instant now = Instant.now();
            IntStream.range(0, 10).forEach(i -> {
                Instant reserved = now.minus(Duration.ofDays(30L * (i + 1)));
                Instant returned = reserved.plus(Duration.ofHours(2));
                createReturnedReservation(u, reserved, returned);
            });
        }

        // bronzeNearSilver
        String bronzeEmail = "bronzenearsilver@example.com";
        String bronzeUsername = "nearSilver";
        Optional<User> maybeBronze = findUserByEmailOrUsername(bronzeEmail, bronzeUsername);
        if (maybeBronze.isEmpty()) {
            User u = createUserIfMissing(bronzeEmail, bronzeUsername, "Bronze", "AlmostSilver", "RIDER", "2 Demo Ln", LoyaltyTier.BRONZE);
            Instant now = Instant.now();
            IntStream.range(0, 12).forEach(i -> {
                Instant reserved = now.minus(Duration.ofDays(10L * (i + 1)));
                Instant returned = reserved.plus(Duration.ofHours(1));
                createReturnedReservation(u, reserved, returned);
            });
            IntStream.range(0, 4).forEach(i -> {
                Instant reserved = now.minus(Duration.ofDays(20L * (i + 1)));
                createClaimedReservation(u, reserved);
            });
            ZonedDateTime zNow = ZonedDateTime.ofInstant(now, ZoneId.systemDefault());
            for (int m = 0; m < 3; m++) {
                YearMonth ym = YearMonth.from(zNow.minusMonths(m));
                LocalDateTime start = ym.atDay(1).atStartOfDay();
                Instant from = start.atZone(ZoneId.systemDefault()).toInstant();
                IntStream.range(0, 6).forEach(i -> {
                    Instant reserved = from.plus(Duration.ofDays(i + 1));
                    createReturnedReservation(u, reserved, reserved.plus(Duration.ofHours(1)));
                });
            }
        }

        // silverNearGold
        String silverEmail = "silverneargold@example.com";
        String silverUsername = "nearGold";
        Optional<User> maybeSilver = findUserByEmailOrUsername(silverEmail, silverUsername);
        if (maybeSilver.isEmpty()) {
            User u = createUserIfMissing(silverEmail, silverUsername, "Silver", "AlmostGold", "RIDER", "3 Demo Ln", LoyaltyTier.SILVER);
            Instant now = Instant.now();
            ZonedDateTime zNow = ZonedDateTime.ofInstant(now, ZoneId.systemDefault());
            for (int week = 0; week < 13; week++) {
                ZonedDateTime reference = zNow.minusWeeks(week);
                LocalDate weekStartDate = reference.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).toLocalDate();
                Instant weekStart = weekStartDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
                int count = (week == 5) ? 5 : 6;
                for (int i = 0; i < count; i++) {
                    Instant reserved = weekStart.plus(Duration.ofDays(i));
                    createReturnedReservation(u, reserved, reserved.plus(Duration.ofHours(1)));
                }
            }
        }
    }

    // Helper: create a RETURNED reservation (basic fields used by tier evaluation)
    private void createReturnedReservation(User rider, Instant reservedAt, Instant returnedAt) {
        Reservation r = new Reservation();
        r.setRider(rider);
        r.setReservedAt(reservedAt);
        r.setExpiresAt(reservedAt.plus(Duration.ofMinutes(5)));
        r.setActive(false);
        r.setClaimedAt(reservedAt.plus(Duration.ofMinutes(5)));
        r.setReturnedAt(returnedAt);
        r.setStatus(ReservationStatus.RETURNED);
        reservationRepo.save(r);
    }

    // Helper: create a CLAIMED reservation (not returned yet)
    private void createClaimedReservation(User rider, Instant reservedAt) {
        Reservation r = new Reservation();
        r.setRider(rider);
        r.setReservedAt(reservedAt);
        r.setExpiresAt(reservedAt.plus(Duration.ofMinutes(5)));
        r.setActive(true);
        r.setClaimedAt(reservedAt.plus(Duration.ofMinutes(2)));
        r.setStatus(ReservationStatus.CLAIMED);
        reservationRepo.save(r);
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

        for (int i = 1; i <= s1.getCapacity(); i++) {
            Dock dock = new Dock();
            dock.setId("S1D" + i);
            dock.setName("Dock " + i);
            dock.setStation(s1);
            s1.getDocks().add(dock);

            if (i <= 13) {
                dock.setStatus(DockStatus.OCCUPIED);
                Bike bike = new Bike();
                bike.setId("S1B" + i);
                bike.setStatus(BikeStatus.AVAILABLE);
                bike.setType(BikeType.STANDARD);
                bike.setDock(dock);
                dock.setBike(bike);
            } else {
                dock.setStatus(DockStatus.EMPTY);
            }
        }

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

        // remove dependent data first
        tripRepo.deleteAll();
        reservationRepo.deleteAll();

        // stations/bikes/docks
        bikeRepo.deleteAll();
        dockRepo.deleteAll();
        stationRepo.deleteAll();

        // users last (they may be referenced by other tables)
        userRepo.deleteAll();

        // rebuild baseline
        run();

        System.out.println("Demo data reloaded successfully.");
    }
}
