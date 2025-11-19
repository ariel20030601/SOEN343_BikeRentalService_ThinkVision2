package com.thinkvision.backend.entity;

public enum ReservationStatus {
    RESERVED,   // reserved but not claimed
    CLAIMED,    // bike claimed / ride started
    RETURNED,   // returned successfully
    MISSED      // reservation expired / missed claim
}