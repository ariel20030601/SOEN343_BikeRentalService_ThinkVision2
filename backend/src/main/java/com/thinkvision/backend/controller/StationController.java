package com.thinkvision.backend.controller;

import com.thinkvision.backend.entity.Station;
import com.thinkvision.backend.repository.StationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/stations")
public class StationController {

    private final StationRepository stationRepo;

    public StationController(StationRepository stationRepo) {
        this.stationRepo = stationRepo;
    }

    // GET all stations
    @GetMapping
    public List<Station> getAllStations() {
        return stationRepo.findAll();
    }

    // GET one station by ID (optional)
    @GetMapping("/{id}")
    public Station getStationById(@PathVariable String id) {
        return stationRepo.findById(id)
                .orElseThrow(() -> new IllegalStateException("Station not found"));
    }
}
