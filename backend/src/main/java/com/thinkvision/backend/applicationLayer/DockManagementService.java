package com.thinkvision.backend.applicationLayer;

import com.thinkvision.backend.applicationLayer.dto.EventPublisher;
import com.thinkvision.backend.entity.Dock;
import com.thinkvision.backend.repository.DockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class DockManagementService {

    private final DockRepository dockRepo;
    private final EventPublisher eventPublisher;

    public DockManagementService(DockRepository dockRepo, EventPublisher eventPublisher) {
        this.dockRepo = dockRepo;
        this.eventPublisher = eventPublisher;
    }

    // Checks if dock exists, checks if status is already out_of_service.
    // If not, sets out_of_service to true, saves the new status to database and emits event.
    @Transactional
    public String toggleOutOfService(Long dockId, boolean outOfService, String operatorId)
    {
        Dock dock = dockRepo.findById(dockId)
                .orElseThrow(() -> new IllegalStateException("Dock not found"));

        boolean previous = dock.isOutOfService();
        if (previous == outOfService) {
            return "No change: dock already " + (outOfService ? "out_of_service" : "in_service");
        }

        dock.setOutOfService(outOfService);
        dockRepo.save(dock);

        // Emit event: when toggled to out_of_service emit explicit event required by R-BMS-07
        if (outOfService) {
            eventPublisher.publish("DockOutOfService", dockId.toString());
        } else {
            eventPublisher.publish("DockBackInService", dockId.toString());
        }

        return "Dock " + dockId + " status set to " + (outOfService ? "out_of_service" : "in_service");
    }

}
