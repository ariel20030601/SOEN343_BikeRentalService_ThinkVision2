package com.thinkvision.backend.controller;

import com.thinkvision.backend.applicationLayer.bms.OperatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/operator")
@CrossOrigin(origins = "*")
public class OperatorController {

    @Autowired
    private OperatorService operatorService;

    @PostMapping("/move")
    public ResponseEntity<String> moveBike(@RequestParam Integer operatorId,
                                           @RequestParam String fromStationId,
                                           @RequestParam String toStationId,
                                           @RequestParam String bikeId) {
        operatorService.moveBike(operatorId, fromStationId, toStationId, bikeId);
        return ResponseEntity.ok("Bike moved successfully");
    }

    @PostMapping("/toggle-station")
    public ResponseEntity<String> toggleStation(@RequestParam Integer operatorId,
                                                @RequestParam String stationId) {
        operatorService.toggleStationStatus(operatorId, stationId);
        return ResponseEntity.ok("Station status toggled");
    }
}

