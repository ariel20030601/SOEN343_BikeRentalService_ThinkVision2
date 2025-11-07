package com.thinkvision.backend.applicationLayer.prc;

import com.thinkvision.backend.applicationLayer.dto.TripSummaryDTO;
import com.thinkvision.backend.entity.Bike;
import com.thinkvision.backend.entity.TripReceipt;
import com.thinkvision.backend.repository.BikeRepository;
import com.thinkvision.backend.repository.TripReceiptRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillingHistoryService {

    private final TripReceiptRepository tripReceiptRepo;
    private final BikeRepository bikeRepo;

    public BillingHistoryService(TripReceiptRepository tripReceiptRepo, BikeRepository bikeRepo) {
        this.tripReceiptRepo = tripReceiptRepo;
        this.bikeRepo = bikeRepo;
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

            return new TripSummaryDTO(
                    r.getTripId(),
                    bikeType,
                    r.getStartStationId(),
                    r.getEndStationId(),
                    startTime,
                    endTime,
                    durationMinutes,
                    r.getFare()
            );
        }).collect(Collectors.toList());
    }
}
