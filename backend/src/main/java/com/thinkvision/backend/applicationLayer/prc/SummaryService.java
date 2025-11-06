// java
package com.thinkvision.backend.applicationLayer.prc;

import com.thinkvision.backend.applicationLayer.dto.BillComputedEvent;
import com.thinkvision.backend.applicationLayer.dto.TripSummaryDTO;
import com.thinkvision.backend.entity.Station;
import com.thinkvision.backend.entity.TripReceipt;
import com.thinkvision.backend.repository.BikeRepository;
import com.thinkvision.backend.repository.StationRepository;
import com.thinkvision.backend.repository.TripReceiptRepository;
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
    private TripReceiptRepository tripReceiptRepo;

    @Autowired
    private BikeRepository bikeRepo;

    private final Map<Long, TripSummaryDTO> cache = new ConcurrentHashMap<>();

    @EventListener
    public void buildSummary(BillComputedEvent event) {

        Long tripId = event.getTrip().getId();
        String bikeType = event.getBike().getType().name();

        Optional<Station> startStationOpt = stationRepo.findById(event.getTrip().getStartStationId());
        if (startStationOpt.isEmpty()) return;
        String startStationName = startStationOpt.get().getName();

        Optional<Station> endStationOpt = stationRepo.findById(event.getTrip().getEndStationId());
        if (endStationOpt.isEmpty()) return;
        String endStationName = endStationOpt.get().getName();

        long startTime = event.getTrip().getStartTime().toEpochMilli();
        long endTime = event.getTrip().getEndTime().toEpochMilli();
        long durationMinutes = Math.max(1, (endTime - startTime) / 60000);
        double cost = event.getCost();

        TripSummaryDTO tripSummaryDTO = new TripSummaryDTO(tripId, bikeType, startStationName, endStationName,
                startTime, endTime, durationMinutes, cost);

        cache.put(tripId, tripSummaryDTO);
    }

    public Optional<TripSummaryDTO> getSummary(Long tripId) {
        // return cached if present
        TripSummaryDTO cached = cache.get(tripId);
        if (cached != null) return Optional.of(cached);

        // fallback: try to build from persistent TripReceipt
        Optional<TripReceipt> receiptOpt = tripReceiptRepo.findByTripId(tripId);
        if (receiptOpt.isEmpty()) return Optional.empty();

        TripReceipt receipt = receiptOpt.get();

        // resolve station names
        Optional<Station> startStationOpt = stationRepo.findById(receipt.getStartStationId());
        Optional<Station> endStationOpt = stationRepo.findById(receipt.getEndStationId());
        if (startStationOpt.isEmpty() || endStationOpt.isEmpty()) return Optional.empty();

        String startStationName = startStationOpt.get().getName();
        String endStationName = endStationOpt.get().getName();

        // resolve bike type (best-effort)
        String bikeType = bikeRepo.findById(receipt.getBikeId())
                .map(b -> b.getType().name())
                .orElse("UNKNOWN");

        long startTime = receipt.getStartDate().toEpochMilli();
        long endTime = receipt.getEndDate().toEpochMilli();
        long durationMinutes = Math.max(1, (endTime - startTime) / 60000);
        double cost = receipt.getFare();

        TripSummaryDTO dto = new TripSummaryDTO(tripId, bikeType, startStationName, endStationName,
                startTime, endTime, durationMinutes, cost);

        cache.put(tripId, dto);
        return Optional.of(dto);
    }
}