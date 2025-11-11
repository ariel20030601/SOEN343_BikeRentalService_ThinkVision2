package com.thinkvision.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.entity.StationStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Getter
@Setter
@Table(name = "stations", schema = "bibixidb")
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
    @OrderBy("name ASC")
    @JsonManagedReference
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

    @JsonProperty("docks")
    public List<Dock> getSortedDocks() {
        if (docks == null) return Collections.emptyList();
        return docks.stream()
                .sorted(Comparator.comparingInt(d -> {
                    try {
                        // extract digits from the dock name (like "Dock 12" → 12)
                        return Integer.parseInt(d.getName().replaceAll("\\D", ""));
                    } catch (NumberFormatException e) {
                        return 0;
                    }
                }))
                .collect(Collectors.toList());
    }
}
