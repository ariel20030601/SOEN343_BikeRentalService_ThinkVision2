package com.thinkvision.backend.applicationLayer.prc;

import com.thinkvision.backend.applicationLayer.dto.TripEndedEvent;
import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BillCalculatorTest {

    @Mock
    private TripRepository tripRepo;
    @Mock
    private TripReceiptRepository tripReceiptRepo;
    @Mock
    private StationRepository stationRepo;
    @Mock
    private BikeRepository bikeRepo;
    @Mock
    private ApplicationEventPublisher applicationEventPublisher;

    @InjectMocks
    private BillCalculator billCalculator;

    @Captor
    ArgumentCaptor<TripReceipt> receiptCaptor;

    @Test
    public void computeCost_standardBike_createsReceiptWithExpectedFare() {
        User user = new User(); user.setId(5);
        Trip trip = new Trip();
        trip.setId(100L);
        trip.setRider(user);
        trip.setBikeId("S-BIKE-1");
        trip.setStartTime(Instant.now().minusSeconds(60 * 40)); // 40 minutes
        trip.setEndTime(Instant.now());

        Bike bike = new Bike(); bike.setId("S-BIKE-1"); bike.setType(BikeType.STANDARD);

        when(tripRepo.findById(100L)).thenReturn(Optional.of(trip));
        when(bikeRepo.findById("S-BIKE-1")).thenReturn(Optional.of(bike));

        billCalculator.computeCost(new TripEndedEvent(100L));

        verify(tripReceiptRepo).save(receiptCaptor.capture());
        TripReceipt saved = receiptCaptor.getValue();
        // Standard plan: 40 minutes => base 10.0 + 10 * 0.25 = 12.5
        assertThat(saved.getFare()).isEqualTo(12.5);
    }

    @Test
    public void computeCost_ebike_createsHigherFare() {
        User user = new User(); user.setId(6);
        Trip trip = new Trip();
        trip.setId(101L);
        trip.setRider(user);
        trip.setBikeId("E-BIKE-1");
        trip.setStartTime(Instant.now().minusSeconds(60 * 20)); // 20 minutes -> base fare
        trip.setEndTime(Instant.now());

        Bike bike = new Bike(); bike.setId("E-BIKE-1"); bike.setType(BikeType.E_BIKE);

        when(tripRepo.findById(101L)).thenReturn(Optional.of(trip));
        when(bikeRepo.findById("E-BIKE-1")).thenReturn(Optional.of(bike));

        billCalculator.computeCost(new TripEndedEvent(101L));

        verify(tripReceiptRepo).save(receiptCaptor.capture());
        TripReceipt saved = receiptCaptor.getValue();
        assertThat(saved.getFare()).isEqualTo(15.0);
    }
}
