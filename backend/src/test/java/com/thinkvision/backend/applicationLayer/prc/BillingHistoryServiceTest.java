package com.thinkvision.backend.applicationLayer.prc;

import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.BikeRepository;
import com.thinkvision.backend.repository.TripReceiptRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class BillingHistoryServiceTest {

    @Mock
    private TripReceiptRepository tripReceiptRepo;
    @Mock
    private BikeRepository bikeRepo;

    @InjectMocks
    private BillingHistoryService billingHistoryService;

    @Test
    public void getBillingHistoryForUser_mapsReceiptsToSummaries() {
        TripReceipt r = new TripReceipt(1L, 7, Instant.now().minusSeconds(600), Instant.now(), "B-ID", "S1", "S2", 5.0);
        when(tripReceiptRepo.findAllByUserIdOrderByStartDateDesc(7)).thenReturn(List.of(r));
        Bike bike = new Bike(); bike.setId("B-ID"); bike.setType(BikeType.E_BIKE);
        when(bikeRepo.findById("B-ID")).thenReturn(Optional.of(bike));

        List<com.thinkvision.backend.applicationLayer.dto.TripSummaryDTO> summaries = billingHistoryService.getBillingHistoryForUser(7);

        assertThat(summaries).hasSize(1);
        assertThat(summaries.get(0).getBikeType()).isEqualTo("E_BIKE");
        assertThat(summaries.get(0).getCost()).isEqualTo(5.0);
    }

    @Test
    public void operatorCanSearchUserHistory_andRetrieveTripSummaries() {
        // Operator searches for user id=42 and expects two receipts
        TripReceipt r1 = new TripReceipt(11L, 42, Instant.now().minusSeconds(3600), Instant.now().minusSeconds(1800), "B1", "S-A", "S-B", 8.0);
        TripReceipt r2 = new TripReceipt(12L, 42, Instant.now().minusSeconds(7200), Instant.now().minusSeconds(6600), "B2", "S-C", "S-D", 3.5);
        when(tripReceiptRepo.findAllByUserIdOrderByStartDateDesc(42)).thenReturn(List.of(r1, r2));

        Bike bike1 = new Bike(); bike1.setId("B1"); bike1.setType(BikeType.STANDARD);
        Bike bike2 = new Bike(); bike2.setId("B2"); bike2.setType(BikeType.E_BIKE);
        when(bikeRepo.findById("B1")).thenReturn(Optional.of(bike1));
        when(bikeRepo.findById("B2")).thenReturn(Optional.of(bike2));

        List<com.thinkvision.backend.applicationLayer.dto.TripSummaryDTO> summaries = billingHistoryService.getBillingHistoryForUser(42);

        assertThat(summaries).hasSize(2);
        // verify elements contain expected mapping data
        assertThat(summaries.get(0).getTripId()).isEqualTo(11L);
        assertThat(summaries.get(0).getBikeType()).isEqualTo("STANDARD");
        assertThat(summaries.get(0).getStartStationName()).isEqualTo("S-A");
        assertThat(summaries.get(0).getEndStationName()).isEqualTo("S-B");

        assertThat(summaries.get(1).getTripId()).isEqualTo(12L);
        assertThat(summaries.get(1).getBikeType()).isEqualTo("E_BIKE");
        assertThat(summaries.get(1).getCost()).isEqualTo(3.5);
    }
}
