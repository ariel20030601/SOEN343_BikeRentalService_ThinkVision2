package com.thinkvision.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import org.springframework.data.annotation.Id;

@Entity
public class Dock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location; // optional
    private int capacity;
    private int availableBikes;
    private boolean outOfService;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public int getAvailableBikes() {
        return availableBikes;
    }

    public void setAvailableBikes(int availableBikes) {
        this.availableBikes = availableBikes;
    }

    public boolean isOutOfService() {
        return outOfService;
    }

    public void setOutOfService(boolean outOfService) {
        this.outOfService = outOfService;
    }


    public boolean hasFreeSpace() {
        return availableBikes < capacity;
    }

    public boolean hasAvailableBikes() {
        return availableBikes > 0;
    }
}
