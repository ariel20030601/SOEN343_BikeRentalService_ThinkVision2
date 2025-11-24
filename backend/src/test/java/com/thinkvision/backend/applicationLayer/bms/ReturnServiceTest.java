package com.thinkvision.backend.applicationLayer.bms;

import com.thinkvision.backend.applicationLayer.dto.TripEndedEvent;
import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.*;
import com.thinkvision.backend.applicationLayer.dto.EventPublisher;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReturnServiceTest {

    @Mock
    private TripRepository tripRepo;
    @Mock
    private DockRepository dockRepo;
    @Mock
    private BikeRepository bikeRepo;
    @Mock
    private UserRepository userRepo;
    @Mock
    private EventPublisher eventPublisher;
    @Mock
    private org.springframework.context.ApplicationEventPublisher applicationEventPublisher;
    @Mock
    private StationService stationService;

    @InjectMocks
    private ReturnService returnService;

    @Test
    public void returnBike_happyPath_updatesEntitiesAndPublishesEvents() {
        User user = new User(); user.setId(2);
        Trip trip = new Trip();
        trip.setId(10L);
        trip.setRider(user);
        trip.setBikeId("BK1");
        trip.setActive(true);
        trip.setStartTime(Instant.now().minusSeconds(60 * 15));

        Dock dock = new Dock(); dock.setId("D2"); dock.setStatus(DockStatus.EMPTY);

        Bike bike = new Bike(); bike.setId("BK1"); bike.setStatus(BikeStatus.ON_TRIP);

        when(userRepo.findById(2)).thenReturn(Optional.of(user));
        when(tripRepo.findFirstByRiderAndBikeIdAndActiveTrue(user, "BK1")).thenReturn(Optional.of(trip));
        when(dockRepo.findFirstByStation_IdAndStatus("S2", DockStatus.EMPTY)).thenReturn(Optional.of(dock));
        when(bikeRepo.findById("BK1")).thenReturn(Optional.of(bike));

        Trip res = returnService.returnBike(2, "S2", "BK1");

        assertThat(res.getEndStationId()).isEqualTo("S2");
        assertThat(res.isActive()).isFalse();

        verify(tripRepo).save(trip);
        verify(bikeRepo).save(bike);
        verify(dockRepo).save(dock);
        verify(stationService).updateOccupancy("S2");
        verify(eventPublisher).publish(eq("TripEnded"), eq(trip.getId()));
        verify(applicationEventPublisher).publishEvent(any(TripEndedEvent.class));
    }

    @Test
    public void returnBike_noDock_throws() {
        User user = new User(); user.setId(3);
        Trip trip = new Trip(); trip.setRider(user); trip.setBikeId("BK2"); trip.setActive(true);

        when(userRepo.findById(3)).thenReturn(Optional.of(user));
        when(tripRepo.findFirstByRiderAndBikeIdAndActiveTrue(user, "BK2")).thenReturn(Optional.of(trip));
        when(dockRepo.findFirstByStation_IdAndStatus("S3", DockStatus.EMPTY)).thenReturn(Optional.empty());

        assertThrows(IllegalStateException.class, () -> returnService.returnBike(3, "S3", "BK2"));
    }
}
