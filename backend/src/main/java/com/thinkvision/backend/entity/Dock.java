package com.thinkvision.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "docks")
@Getter
@Setter
public class Dock {
    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "name", length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private DockStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "station_id")
    private Station station;

    @OneToOne(mappedBy = "dock", fetch = FetchType.LAZY)
    @JsonManagedReference
    private Bike bike;

    @Version
    private Long version; // <-- Add this line

    public Dock() {}

    public Dock(String name, DockStatus status, Station station, Bike bike) {
        this.name = name;
        this.status = status;
        this.station = station;
        this.bike = bike;
    }
}
