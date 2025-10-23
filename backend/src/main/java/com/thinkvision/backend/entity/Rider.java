package com.thinkvision.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "riders")
public class Rider {

    @Id
    private String id;

    @Column(unique = true)
    private String username;

    /**
     * Lightweight logged-in flag used by CLI/service checks.
     * In a real system authentication is handled elsewhere; this field
     * is provided to match the ReserveBike usage.
     */
    @Column(name = "logged_in")
    private boolean loggedIn;

    public Rider() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public boolean isLoggedIn() {
        return loggedIn;
    }

    public void setLoggedIn(boolean loggedIn) {
        this.loggedIn = loggedIn;
    }
}
