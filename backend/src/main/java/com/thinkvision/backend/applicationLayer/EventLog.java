// java
package com.thinkvision.backend.applicationLayer;
import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class EventLog {
    private final String id;
    private final String type;
    private final Instant timestamp;
    private final Map<String, String> properties = new HashMap<>();

    public EventLog(String type) {
        this.id = UUID.randomUUID().toString();
        this.type = type;
        this.timestamp = Instant.now();
    }

    public EventLog with(String key, Object value) {
        properties.put(key, value == null ? null : value.toString());
        return this;
    }

    public String getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public Map<String, String> getProperties() {
        return Collections.unmodifiableMap(properties);
    }

    @Override
    public String toString() {
        return "Event{" +
                "id='" + id + '\'' +
                ", type='" + type + '\'' +
                ", timestamp=" + timestamp +
                ", properties=" + properties +
                '}';
    }
}
