package com.thinkvision.backend.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "bikes")
@Getter
@Setter
public class Bike {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Enumerated(EnumType.STRING)
    private BikeType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BikeStatus status;

    private Instant reservationExpiry;

    @OneToOne
    @JoinColumn(name = "dock_id")
    @JsonIgnore
    private Dock dock;

    public Bike() {}

    public Bike(String id, BikeStatus status, Dock dock) {
        this.id = id;
        this.status = status;
        this.dock = dock;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public BikeStatus getStatus() {
        return status;
    }

    public void setStatus(BikeStatus status) {
        this.status = status;
    }

    public Dock getDock() {
        return dock;
    }

    public void setDock(Dock dock) {
        this.dock = dock;
    }
}
