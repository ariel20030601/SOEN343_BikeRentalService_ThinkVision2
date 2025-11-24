package com.thinkvision.backend.applicationLayer.bms;

import com.thinkvision.backend.applicationLayer.dto.EventPublisher;
import com.thinkvision.backend.entity.DockStatus;
import com.thinkvision.backend.entity.Station;
import com.thinkvision.backend.entity.StationStatus;
import com.thinkvision.backend.repository.DockRepository;
import com.thinkvision.backend.repository.StationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class StationServiceTest {

    @Mock
    private StationRepository stationRepo;
    @Mock
    private DockRepository dockRepo;
    @Mock
    private EventPublisher eventPublisher;

    @InjectMocks
    private StationService stationService;

    @Test
    public void updateOccupancy_publishesRebalanceAlert_whenBecomesEmpty() {
        String stationId = "ST-1";
        Station s = new Station();
        s.setId(stationId);
        s.setCapacity(10);
        s.setAvailableBikes(1);
        s.setFreeDocks(9);
        s.setStatus(StationStatus.OCCUPIED);

        when(stationRepo.findById(stationId)).thenReturn(java.util.Optional.of(s));
        // simulate no occupied docks -> availableBikes = 0
        when(dockRepo.countByStation_IdAndStatus(stationId, DockStatus.OCCUPIED)).thenReturn(0L);

        stationService.updateOccupancy(stationId);

        // should save the station with EMPTY status and publish StationStatusChanged + RebalanceAlert
        verify(stationRepo).save(s);
        verify(eventPublisher).publish("StationStatusChanged", stationId);
        verify(eventPublisher).publish("RebalanceAlert", stationId);
    }
}
