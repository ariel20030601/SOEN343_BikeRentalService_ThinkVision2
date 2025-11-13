package com.thinkvision.backend.applicationLayer.bms;

import com.thinkvision.backend.applicationLayer.dto.EventPublisher;
import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class OperatorService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private BikeRepository bikeRepo;

    @Autowired
    private DockRepository dockRepo;

    @Autowired
    private StationRepository stationRepo;

    @Autowired
    private EventPublisher eventPublisher;

    @Autowired
    private StationService stationService;

    @Autowired
    private DemoDataLoader demoDataLoader;

    /**
     * Move a bike manually between stations
     */
    public void moveBike(Integer operatorId, String fromStationId, String toStationId, String bikeId) {
        // Validate operator
        User operator = userRepo.findById(operatorId)
                .orElseThrow(() -> new IllegalStateException("Operator not found"));

        if (!"OPERATOR".equalsIgnoreCase(operator.getRole()))
            throw new IllegalStateException("User not authorized to move bikes");

        // Load bike
        Bike bike = bikeRepo.findById(bikeId)
                .orElseThrow(() -> new IllegalStateException("Bike not found"));

        // Validate source station
        Station fromStation = stationRepo.findById(fromStationId)
                .orElseThrow(() -> new IllegalStateException("Source station not found"));

        // Validate destination station
        Station toStation = stationRepo.findById(toStationId)
                .orElseThrow(() -> new IllegalStateException("Destination station not found"));

        if (toStation.getStatus() == StationStatus.OUT_OF_SERVICE)
            throw new IllegalStateException("Destination station is out of service");

        // Find free dock at destination
        Dock freeDock = dockRepo.findFirstByStation_IdAndStatus(toStationId, DockStatus.EMPTY)
                .orElseThrow(() -> new IllegalStateException("No free dock available at destination"));

        // Detach from old dock (if any)
        Dock oldDock = bike.getDock();
        if (oldDock != null) {
            oldDock.setStatus(DockStatus.EMPTY);
            dockRepo.save(oldDock);
        }

        // Attach to new dock
        bike.setDock(freeDock);
        bike.setStatus(BikeStatus.AVAILABLE);
        bikeRepo.save(bike);

        freeDock.setStatus(DockStatus.OCCUPIED);
        dockRepo.save(freeDock);

        // Recalculate occupancy
        stationService.updateOccupancy(fromStationId);
        stationService.updateOccupancy(toStationId);

        eventPublisher.publish("BikeMoved", bikeId);
        System.out.println("Operator " + operator.getUsername() + " moved bike " + bikeId + " to " + toStationId);
    }

    /**
     * Toggle station active / out of service
     */
    public Station toggleStationStatus(Integer operatorId, String stationId) {
        User operator = userRepo.findById(operatorId)
                .orElseThrow(() -> new IllegalStateException("Operator not found"));

        if (!"OPERATOR".equalsIgnoreCase(operator.getRole()))
            throw new IllegalStateException("User not authorized to toggle stations");

        Station station = stationRepo.findById(stationId)
                .orElseThrow(() -> new IllegalStateException("Station not found"+ stationId));

        if (station.getStatus() == StationStatus.OUT_OF_SERVICE) {
            station.setStatus(StationStatus.OCCUPIED);
            System.out.println("Station " + station.getId() + " reactivated.");
            eventPublisher.publish("StationActivated", stationId);
        } else {
            station.setStatus(StationStatus.OUT_OF_SERVICE);
            System.out.println("Station " + station.getId() + " marked out of service.");
            eventPublisher.publish("StationOutOfService", stationId);
        }

        return stationRepo.save(station);
    }

    /**
     * Toggle dock status between OCCUPIED, EMPTY, and OUT_OF_SERVICE
     */
    public Dock toggleDockStatus(Integer operatorId, String dockId) {
        // Validate operator
        User operator = userRepo.findById(operatorId)
                .orElseThrow(() -> new IllegalStateException("Operator not found"));

        if (!"OPERATOR".equalsIgnoreCase(operator.getRole()))
            throw new IllegalStateException("User not authorized to toggle dock status");

        // Force fetch dock WITH its bike (avoids lazy-loading nulls)
        Dock dock = dockRepo.findById(dockId)
                .orElseThrow(() -> new IllegalStateException("Dock not found"));

        // Make sure to refresh the bike reference if needed
        if (dock.getBike() == null) {
            Optional<Bike> linkedBike = bikeRepo.findByDock_Id(dockId);
            linkedBike.ifPresent(dock::setBike);
        }

        // Toggle logic
        if (dock.getStatus() == DockStatus.OUT_OF_SERVICE) {
            if (dock.getBike() != null) {
                dock.setStatus(DockStatus.OCCUPIED);
                System.out.println("Dock " + dockId + " reactivated (occupied).");
                eventPublisher.publish("DockActivatedOccupied", dockId);
            } else {
                dock.setStatus(DockStatus.EMPTY);
                System.out.println("Dock " + dockId + " reactivated (empty).");
                eventPublisher.publish("DockActivatedEmpty", dockId);
            }
        } else {
            dock.setStatus(DockStatus.OUT_OF_SERVICE);
            System.out.println("Dock " + dockId + " set out of service.");
            eventPublisher.publish("DockOutOfService", dockId);
        }

        Dock saved = dockRepo.save(dock);

        // Refresh station occupancy counts
        stationService.updateOccupancy(dock.getStation().getId());

        return saved;
    }


    /**
     * Toggle Bike Status between AVAILABLE and MAINTENANCE
     */
    public Bike toggleBikeMaintenance(Integer operatorId, String bikeId) {
        User operator = userRepo.findById(operatorId)
                .orElseThrow(() -> new IllegalStateException("Operator not found"));

        if (!"OPERATOR".equalsIgnoreCase(operator.getRole()))
            throw new IllegalStateException("User not authorized to toggle maintenance");

        Bike bike = bikeRepo.findById(bikeId)
                .orElseThrow(() -> new IllegalStateException("Bike not found"));

        if (bike.getStatus() == BikeStatus.MAINTENANCE) {
            bike.setStatus(BikeStatus.AVAILABLE);
            eventPublisher.publish("BikeRestored", bikeId);
        } else {
            bike.setStatus(BikeStatus.MAINTENANCE);
            eventPublisher.publish("BikeMaintenance", bikeId);
        }

        bikeRepo.save(bike);
        System.out.println("Bike " + bikeId + " maintenance toggled by operator " + operator.getUsername());
        return bike;
    }

    /**
     * Reset system to initial demo data (admin or operator only)
     */
    public void resetSystem(Integer operatorId) {
        User operator = userRepo.findById(operatorId)
                .orElseThrow(() -> new IllegalStateException("Operator not found"));

        if (!"OPERATOR".equalsIgnoreCase(operator.getRole()))
            throw new IllegalStateException("User not authorized to reset the system");

        System.out.println("Operator " + operator.getUsername() + " triggered a system reset.");

        demoDataLoader.reloadDemoData();
        eventPublisher.publish("SystemReset", "All data reloaded to demo baseline.");
    }

    /**
     * Add a new bike to a station
     */
    @Transactional
    public Bike addBikeToStation(Integer operatorId, String stationId, String bikeId, BikeType type) {
        // Validate operator
        User operator = userRepo.findById(operatorId)
                .orElseThrow(() -> new IllegalStateException("Operator not found"));
        if (!"OPERATOR".equalsIgnoreCase(operator.getRole())) {
            throw new IllegalStateException("User not authorized to add bikes");
        }

        // Check bike id uniqueness
        if (bikeRepo.existsById(bikeId)) {
            throw new IllegalStateException("Bike id already exists: " + bikeId);
        }

        // Validate station
        Station station = stationRepo.findById(stationId)
                .orElseThrow(() -> new IllegalStateException("Station not found: " + stationId));
        if (station.getStatus() == StationStatus.OUT_OF_SERVICE) {
            throw new IllegalStateException("Destination station is out of service");
        }

        // Find a free dock (managed entity in the current transaction)
        Dock freeDock = dockRepo.findFirstByStation_IdAndStatus(stationId, DockStatus.EMPTY)
                .orElseThrow(() -> new IllegalStateException("No free dock available at station: " + stationId));

        // Ensure dock has no lingering bike reference loaded as a different object
        if (freeDock.getBike() == null) {
            Optional<Bike> linkedBike = bikeRepo.findByDock_Id(freeDock.getId());
            linkedBike.ifPresent(freeDock::setBike);
        }
        if (freeDock.getBike() != null) {
            throw new IllegalStateException("Selected dock is not actually free: " + freeDock.getId());
        }

        // Create bike and persist it first so Hibernate returns a managed instance
        Bike bike = new Bike();
        bike.setId(bikeId);
        bike.setType(type != null ? type : BikeType.STANDARD);
        bike.setStatus(BikeStatus.AVAILABLE);
        bike.setDock(freeDock);

        bike = bikeRepo.saveAndFlush(bike); // ensure managed instance in the persistence context

        // Attach managed bike to dock and persist dock
        freeDock.setBike(bike);
        freeDock.setStatus(DockStatus.OCCUPIED);
        dockRepo.save(freeDock);

        // Refresh station occupancy and publish event
        stationService.updateOccupancy(stationId);
        eventPublisher.publish("BikeAdded", bikeId);

        System.out.println("Operator " + operator.getUsername() + " added bike " + bikeId + " to station " + stationId);
        return bike;
    }




}
