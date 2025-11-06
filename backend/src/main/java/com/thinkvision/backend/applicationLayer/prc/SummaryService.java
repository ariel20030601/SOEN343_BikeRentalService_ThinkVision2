package com.thinkvision.backend.applicationLayer.prc;

import com.thinkvision.backend.applicationLayer.dto.BillComputedEvent;
import com.thinkvision.backend.applicationLayer.dto.TripSummaryDTO;
import com.thinkvision.backend.entity.Station;
import com.thinkvision.backend.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SummaryService {

    @Autowired
    private StationRepository stationRepo;

    @Autowired
    private final Map<Long, TripSummaryDTO> cache = new ConcurrentHashMap<>();

    @EventListener
    public void buildSummary(BillComputedEvent event) {

        Long tripId = event.getTrip().getId();
        String bikeType = event.getBike().getType().name();

        //get start station name
        Optional<Station> startStationOpt = stationRepo.findById(event.getTrip().getStartStationId());
        if (startStationOpt.isEmpty()) return;
        Station startStation = startStationOpt.get();
        String startStationName = startStation.getName();

        Optional<Station> endStationOpt = stationRepo.findById(event.getTrip().getEndStationId());
        if (endStationOpt.isEmpty()) return;
        Station endStation = endStationOpt.get();
        String endStationName = endStation.getName();

        long startTime = event.getTrip().getStartTime().toEpochMilli();
        long endTime = event.getTrip().getEndTime().toEpochMilli();
        long durationMinutes = Math.max(1, (endTime - startTime) / 60000);
        double cost = event.getCost();

        TripSummaryDTO tripSummaryDTO = new TripSummaryDTO(tripId, bikeType, startStationName, endStationName,
                                                startTime, endTime, durationMinutes, cost);

        cache.put(tripId, tripSummaryDTO);
    }

    public Optional<TripSummaryDTO> getSummary(Long tripId) {
        return Optional.ofNullable(cache.get(tripId));
    }
}
