package com.thinkvision.backend.applicationLayer.bms;

import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.*;
import com.thinkvision.backend.applicationLayer.dto.EventPublisher;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReservationServiceTest {

    @Mock
    private BikeRepository bikeRepo;
    @Mock
    private DockRepository dockRepo;
    @Mock
    private ReservationRepository reservationRepo;
    @Mock
    private EventPublisher eventPublisher;
    @Mock
    private UserRepository userRepo;
    @Mock
    private StationService stationService;

    @InjectMocks
    private ReservationService reservationService;

    @Captor
    ArgumentCaptor<Reservation> reservationCaptor;

    @Test
    public void reserveBike_happyPath() {
        User user = new User();
        user.setId(1);

        Station station = new Station();
        station.setId("S1");

        Dock dock = new Dock();
        dock.setId("D1");
        dock.setStatus(DockStatus.EMPTY);
        dock.setStation(station);

        Bike bike = new Bike();
        bike.setId("B1");
        bike.setStatus(BikeStatus.AVAILABLE);
        bike.setDock(dock);

        when(userRepo.findById(1)).thenReturn(Optional.of(user));
        when(bikeRepo.findById("B1")).thenReturn(Optional.of(bike));

        reservationService.reserveBike(1, station.getId(), "B1");


        verify(bikeRepo).save(bike);
        assertThat(bike.getStatus()).isEqualTo(BikeStatus.RESERVED);
        assertThat(bike.getReservationExpiry()).isNotNull();

        verify(reservationRepo).save(reservationCaptor.capture());
        Reservation saved = reservationCaptor.getValue();
        assertThat(saved.getBikeId()).isEqualTo("B1");
        assertThat(saved.getStationId()).isEqualTo(station.getId());

        verify(eventPublisher).publish(eq("BikeReserved, reservationId"), any());
    }

    @Test
    public void expireReservations_movesReservedToAvailable() {
        Bike bike = new Bike();
        bike.setId("B2");
        bike.setStatus(BikeStatus.RESERVED);
        bike.setReservationExpiry(Instant.now().minusSeconds(10));

        when(bikeRepo.findAllByStatusAndReservationExpiryBefore(eq(BikeStatus.RESERVED), any())).thenReturn(List.of(bike));
        when(reservationRepo.findByBikeIdAndActiveTrue("B2")).thenReturn(Optional.empty());

        reservationService.expireReservations();

        verify(reservationRepo, never()).save(any()); // no reservation found
        verify(bikeRepo).save(any(Bike.class));
        verify(eventPublisher).publish(eq("ReservationExpired, bikeId"), eq("B2"));
    }
}
