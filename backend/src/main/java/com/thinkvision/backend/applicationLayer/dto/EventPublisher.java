package com.thinkvision.backend.applicationLayer.dto;

import org.springframework.stereotype.Component;

@Component
public class EventPublisher {

    public void publish(String eventType, Object payload) {
        System.out.println("[EVENT] " + eventType + " -> " + payload);
    }
}


