package com.thinkvision.backend.applicationLayer.prc;

import com.thinkvision.backend.applicationLayer.dto.TripSummaryDTO;
import com.thinkvision.backend.entity.Bike;
import com.thinkvision.backend.entity.TripReceipt;
import com.thinkvision.backend.entity.Station;
import com.thinkvision.backend.repository.BikeRepository;
import com.thinkvision.backend.repository.StationRepository;
import com.thinkvision.backend.repository.TripReceiptRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillingHistoryService {

    private final TripReceiptRepository tripReceiptRepo;
    private final BikeRepository bikeRepo;
    private final StationRepository stationRepo;

    public BillingHistoryService(TripReceiptRepository tripReceiptRepo, BikeRepository bikeRepo, StationRepository stationRepo) {
        this.tripReceiptRepo = tripReceiptRepo;
        this.bikeRepo = bikeRepo;
        this.stationRepo = stationRepo;
    }

    public List<TripSummaryDTO> getBillingHistoryForUser(Integer userId) {
        List<TripReceipt> receipts = tripReceiptRepo.findAllByUserIdOrderByStartDateDesc(userId);

        return receipts.stream().map(r -> {
            String bikeType = bikeRepo.findById(r.getBikeId())
                    .map(Bike::getType)
                    .map(Enum::name)
                    .orElse("UNKNOWN");

            long startTime = r.getStartDate() != null ? r.getStartDate().toEpochMilli() : 0L;
            long endTime = r.getEndDate() != null ? r.getEndDate().toEpochMilli() : 0L;
            long durationMinutes = 0L;
            if (r.getStartDate() != null && r.getEndDate() != null) {
                durationMinutes = Math.max(1, Duration.between(r.getStartDate(), r.getEndDate()).toMinutes());
            }

            String startStationName = stationRepo.findById(r.getStartStationId())
                    .map(Station::getName).orElse(r.getStartStationId());
            String endStationName = stationRepo.findById(r.getEndStationId())
                    .map(Station::getName).orElse(r.getEndStationId());

            return new TripSummaryDTO(
                r.getTripId(),
                bikeType,
                startStationName,
                endStationName,
                startTime,
                endTime,
                durationMinutes,
                r.getFare()
            );
        }).collect(Collectors.toList());
    }
}
