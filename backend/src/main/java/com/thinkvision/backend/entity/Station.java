package com.thinkvision.backend.entity;

import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.entity.StationStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "stations")
public class Station {
    @Id
    private String id;

    private String code;
    private String name;
    private String address;
    private double latitude;
    private double longitude;
    private int capacity;
    private int availableBikes;
    private Integer freeDocks;

    @Enumerated(EnumType.STRING)
    private StationStatus status;

    private int expiresAfterMinutes = 5;

    @OneToMany(mappedBy = "station", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Dock> docks = new ArrayList<>();

    public void updateStatus() {
        if (status == StationStatus.OUT_OF_SERVICE) return;

        if (availableBikes == 0)
            status = StationStatus.EMPTY;
        else if (availableBikes == capacity)
            status = StationStatus.FULL;
        else
            status = StationStatus.OCCUPIED;
    }
}
