package com.thinkvision.backend.applicationLayer.bms;

import com.thinkvision.backend.entity.*;
import org.springframework.stereotype.Component;

@Component
public class BmsHelper {
    public void assertRider(User user) {
        if (user == null)
            throw new IllegalStateException("User not found");
        if (!"RIDER".equalsIgnoreCase(user.getRole()))
            throw new IllegalStateException("Permission denied: requires Rider role");
    }

    public void assertOperator(User user) {
        if (user == null)
            throw new IllegalStateException("User not found");
        if (!"OPERATOR".equalsIgnoreCase(user.getRole()))
            throw new IllegalStateException("Permission denied: requires Operator role");
    }


    // Validate station state
    public void assertStationActive(Station station) {
        if (station.getStatus() == StationStatus.OUT_OF_SERVICE)
            throw new IllegalStateException("Station is out of service");
    }

    // Validate dock state
    public void assertDockActive(Dock dock) {
        if (dock.getStatus() == DockStatus.OUT_OF_SERVICE)
            throw new IllegalStateException("Dock is out of service");
    }

    // Recompute occupancy and station status
    public void recomputeStationOccupancy(Station station) {
        int bikesAvailable = (int) station.getDocks().stream()
                .filter(d -> d.getBike() != null && d.getStatus() != DockStatus.OUT_OF_SERVICE)
                .count();

        station.setAvailableBikes(bikesAvailable);

        if (station.getStatus() == StationStatus.OUT_OF_SERVICE) return;

        if (bikesAvailable == 0)
            station.setStatus(StationStatus.EMPTY);
        else if (bikesAvailable >= station.getCapacity())
            station.setStatus(StationStatus.FULL);
        else
            station.setStatus(StationStatus.OCCUPIED);
    }
}


