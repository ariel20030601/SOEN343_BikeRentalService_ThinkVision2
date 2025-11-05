package com.thinkvision.backend.controller;

import com.thinkvision.backend.applicationLayer.bms.DemoDataLoader;
import com.thinkvision.backend.applicationLayer.bms.OperatorService;
import com.thinkvision.backend.applicationLayer.dto.EventPublisher;
import com.thinkvision.backend.entity.Dock;
import com.thinkvision.backend.entity.Station;
import com.thinkvision.backend.entity.User;
import com.thinkvision.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/operator")
@CrossOrigin(origins = "*")
public class OperatorController {

    @Autowired
    private OperatorService operatorService;
    @Autowired
    private DemoDataLoader demoDataLoader;
    @Autowired
    private UserRepository userRepo;
    private EventPublisher eventPublisher;

    // Move bike between stations
    @PostMapping("/move-bike")
    public String moveBike(@RequestParam Integer operatorId,
                           @RequestParam String fromStationId,
                           @RequestParam String toStationId,
                           @RequestParam String bikeId) {
        operatorService.moveBike(operatorId, fromStationId, toStationId, bikeId);
        return "Bike moved successfully.";
    }

    // Toggle station active/out_of_service
    @PostMapping("/toggle-station")
    public Station toggleStation(@RequestParam Integer operatorId,
                                 @RequestParam String stationId) {
        return operatorService.toggleStationStatus(operatorId, stationId);
    }

    // Toggle dock active/out_of_service
    @PostMapping("/toggle-dock")
    public Dock toggleDock(@RequestParam Integer operatorId,
                           @RequestParam String dockId) {
        return operatorService.toggleDockStatus(operatorId, dockId);
    }

    // Maintenance bike toggle (AVAILABLE/MAINTENANCE)
    @PostMapping("/maintenance-bike")
    public String toggleBikeMaintenance(@RequestParam Integer operatorId,
                                        @RequestParam String bikeId) {
        operatorService.toggleBikeMaintenance(operatorId, bikeId);
        return "Bike maintenance status toggled.";
    }

    @PostMapping("/reset-system")
    public String resetSystem(@RequestParam Integer operatorId) {
        operatorService.resetSystem(operatorId);
        return "System reset to demo baseline successfully.";
    }
}
