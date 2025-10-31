package com.thinkvision.backend.applicationLayer.bms;

import com.thinkvision.backend.applicationLayer.dto.EventPublisher;
import com.thinkvision.backend.entity.DockStatus;
import com.thinkvision.backend.entity.Station;
import com.thinkvision.backend.entity.StationStatus;
import com.thinkvision.backend.repository.DockRepository;
import com.thinkvision.backend.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StationService {

    @Autowired
    private StationRepository stationRepo;

    @Autowired
    private DockRepository dockRepo;

    @Autowired
    private EventPublisher eventPublisher;

    @Transactional
    public void updateOccupancy(String stationId) {
        Station s = stationRepo.findById(stationId)
                .orElseThrow(() -> new IllegalStateException("Station not found: " + stationId));

        long occupied = dockRepo.countByStation_IdAndStatus(stationId, DockStatus.OCCUPIED);
        int availableBikes = (int) occupied;
        int freeDocks = s.getCapacity() - availableBikes;

        StationStatus oldStatus = s.getStatus();

        s.setAvailableBikes(availableBikes);
        s.setFreeDocks(freeDocks);

        if (freeDocks == 0)
            s.setStatus(StationStatus.FULL);
        else if (availableBikes == 0)
            s.setStatus(StationStatus.EMPTY);
        else
            s.setStatus(StationStatus.OCCUPIED);

        stationRepo.save(s);

        if (oldStatus != s.getStatus()) {
            eventPublisher.publish("StationStatusChanged", stationId);
        }
    }
}
