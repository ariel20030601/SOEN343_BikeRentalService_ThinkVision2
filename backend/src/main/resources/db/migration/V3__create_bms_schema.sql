CREATE TABLE docks (
       id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       location VARCHAR(255),
       capacity INT NOT NULL,
       available_bikes INT NOT NULL DEFAULT 0,
       out_of_service BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE bikes (
       id VARCHAR(50) PRIMARY KEY,
       station_id VARCHAR(255),
       status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
       reservation_id VARCHAR(255)
);

CREATE TABLE riders (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        logged_in BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE stations (
          id VARCHAR(255) PRIMARY KEY,
          code VARCHAR(255) NOT NULL UNIQUE,
          available_bikes INT NOT NULL DEFAULT 0,
          total_docks INT NOT NULL DEFAULT 0,
          out_of_service BOOLEAN NOT NULL DEFAULT FALSE,
          expires_after_minutes INT
);

CREATE TABLE reservations (
              id VARCHAR(255) PRIMARY KEY,
              bike_id VARCHAR(50),
              rider_id VARCHAR(255),
              station_id VARCHAR(255),
              reserved_at TIMESTAMP NOT NULL,
              expires_at TIMESTAMP NOT NULL,
              active BOOLEAN NOT NULL DEFAULT TRUE,
              CONSTRAINT fk_reservation_bike FOREIGN KEY (bike_id)
                  REFERENCES bikes(id)
                  ON DELETE CASCADE,
              CONSTRAINT fk_reservation_rider FOREIGN KEY (rider_id)
                  REFERENCES riders(id)
                  ON DELETE CASCADE,
              CONSTRAINT fk_reservation_station FOREIGN KEY (station_id)
                  REFERENCES stations(id)
                  ON DELETE CASCADE
);

CREATE TABLE trips (
       id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
       rider_id VARCHAR(255) NOT NULL,
       bike_id VARCHAR(50) NOT NULL,
       start_station_id VARCHAR(255),
       end_station_id VARCHAR(255),
       start_time TIMESTAMP NOT NULL,
       end_time TIMESTAMP NULL,
       active BOOLEAN NOT NULL DEFAULT TRUE,
       CONSTRAINT fk_trip_bike FOREIGN KEY (bike_id)
           REFERENCES bikes(id)
           ON DELETE CASCADE,
       CONSTRAINT fk_trip_rider FOREIGN KEY (rider_id)
           REFERENCES riders(id)
           ON DELETE CASCADE,
       CONSTRAINT fk_trip_start_station FOREIGN KEY (start_station_id)
           REFERENCES stations(id)
           ON DELETE SET NULL,
       CONSTRAINT fk_trip_end_station FOREIGN KEY (end_station_id)
           REFERENCES stations(id)
           ON DELETE SET NULL
);

CREATE TABLE events (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        entity_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE station_bike_ids (
      station_id VARCHAR(255) NOT NULL,
      bike_ids VARCHAR(255) NOT NULL,
      PRIMARY KEY (station_id, bike_ids),
      CONSTRAINT fk_station_bike_ids_station FOREIGN KEY (station_id)
          REFERENCES stations(id)
          ON DELETE CASCADE
);
