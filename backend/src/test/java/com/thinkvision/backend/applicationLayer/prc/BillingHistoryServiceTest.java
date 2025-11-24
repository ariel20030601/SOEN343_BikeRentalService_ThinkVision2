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
}
