package com.thinkvision.backend.applicationLayer.bms;

import com.thinkvision.backend.applicationLayer.dto.EventPublisher;
import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    /**
     * Move a bike manually between stations
     */
    public void moveBike(Integer operatorId, String fromStationId, String toStationId, String bikeId) {
        // 1️⃣ Validate operator
        User operator = userRepo.findById(operatorId)
                .orElseThrow(() -> new IllegalStateException("Operator not found"));

        if (!"OPERATOR".equalsIgnoreCase(operator.getRole()))
            throw new IllegalStateException("User not authorized to move bikes");

        // 2️⃣ Load bike
        Bike bike = bikeRepo.findById(bikeId)
                .orElseThrow(() -> new IllegalStateException("Bike not found"));

        // 3️⃣ Validate source station
        Station fromStation = stationRepo.findById(fromStationId)
                .orElseThrow(() -> new IllegalStateException("Source station not found"));

        // 4️⃣ Validate destination station
        Station toStation = stationRepo.findById(toStationId)
                .orElseThrow(() -> new IllegalStateException("Destination station not found"));

        if (toStation.getStatus() == StationStatus.OUT_OF_SERVICE)
            throw new IllegalStateException("Destination station is out of service");

        // 5️⃣ Find free dock at destination
        Dock freeDock = dockRepo.findFirstByStation_IdAndStatus(toStationId, DockStatus.EMPTY)
                .orElseThrow(() -> new IllegalStateException("No free dock available at destination"));

        // 6️⃣ Detach from old dock (if any)
        Dock oldDock = bike.getDock();
        if (oldDock != null) {
            oldDock.setStatus(DockStatus.EMPTY);
            dockRepo.save(oldDock);
        }

        // 7️⃣ Attach to new dock
        bike.setDock(freeDock);
        bike.setStatus(BikeStatus.AVAILABLE);
        bikeRepo.save(bike);

        freeDock.setStatus(DockStatus.OCCUPIED);
        dockRepo.save(freeDock);

        // 8️⃣ Recalculate occupancy
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
                .orElseThrow(() -> new IllegalStateException("Station not found"));

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
}
