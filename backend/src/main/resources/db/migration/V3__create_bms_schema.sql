-- =====================================
--  STATIONS
-- =====================================
CREATE TABLE stations (
      id VARCHAR(255) PRIMARY KEY,
      code VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255),
      address VARCHAR(255),
      latitude DOUBLE,
      longitude DOUBLE,
      capacity INT NOT NULL DEFAULT 0,
      available_bikes INT NOT NULL DEFAULT 0,
      status VARCHAR(30) NOT NULL DEFAULT 'EMPTY',      -- EMPTY | OCCUPIED | FULL | OUT_OF_SERVICE
      expires_after_minutes INT DEFAULT 5
);

-- =====================================
--  DOCKS  (Each station has many docks)
-- =====================================
CREATE TABLE docks (
   id VARCHAR(255) PRIMARY KEY,                       -- string-based dock ID
   name VARCHAR(100),
   status VARCHAR(30) NOT NULL DEFAULT 'EMPTY',        -- EMPTY | OCCUPIED | OUT_OF_SERVICE
   station_id VARCHAR(255) NOT NULL,
   CONSTRAINT fk_dock_station FOREIGN KEY (station_id)
       REFERENCES stations(id)
       ON DELETE CASCADE
);

-- =====================================
--  BIKES
-- =====================================
CREATE TABLE bikes (
   id VARCHAR(255) PRIMARY KEY,
   status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',    -- AVAILABLE | RESERVED | ON_TRIP | MAINTENANCE
   type   VARCHAR(30) NOT NULL DEFAULT 'STANDARD',     -- STANDARD | E_BIKE
   reservation_expiry TIMESTAMP NULL,
   dock_id VARCHAR(255),
   CONSTRAINT fk_bike_dock FOREIGN KEY (dock_id)
       REFERENCES docks(id)
       ON DELETE SET NULL
);

-- =====================================
--  RESERVATIONS
-- =====================================
-- sql
-- Option A: Make rider_id BIGINT to match users.id (numeric PK)

-- If editing V3 directly: update definitions below
CREATE TABLE reservations (
                              id VARCHAR(255) PRIMARY KEY,
                              bike_id VARCHAR(255),
                              rider_id INT,
                              station_id VARCHAR(255),
                              reserved_at TIMESTAMP NOT NULL,
                              expires_at TIMESTAMP NOT NULL,
                              active BOOLEAN NOT NULL DEFAULT TRUE,
                              CONSTRAINT fk_res_bike FOREIGN KEY (bike_id)
                                  REFERENCES bikes(id)
                                  ON DELETE CASCADE,
                              CONSTRAINT fk_res_user FOREIGN KEY (rider_id)
                                  REFERENCES users(id)
                                  ON DELETE CASCADE,
                              CONSTRAINT fk_res_station FOREIGN KEY (station_id)
                                  REFERENCES stations(id)
                                  ON DELETE CASCADE
);


-- =====================================
--  TRIPS
-- =====================================
CREATE TABLE trips (
                       id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                       rider_id INT NOT NULL,     -- changed to BIGINT
                       bike_id VARCHAR(255) NOT NULL,
                       start_station_id VARCHAR(255),
                       end_station_id   VARCHAR(255),
                       start_time TIMESTAMP NOT NULL,
                       end_time   TIMESTAMP NULL,
                       active BOOLEAN NOT NULL DEFAULT TRUE,
                       CONSTRAINT fk_trip_bike FOREIGN KEY (bike_id)
                           REFERENCES bikes(id)
                           ON DELETE CASCADE,
                       CONSTRAINT fk_trip_user FOREIGN KEY (rider_id)
                           REFERENCES users(id)
                           ON DELETE CASCADE,
                       CONSTRAINT fk_trip_start_station FOREIGN KEY (start_station_id)
                           REFERENCES stations(id)
                           ON DELETE SET NULL,
                       CONSTRAINT fk_trip_end_station FOREIGN KEY (end_station_id)
                           REFERENCES stations(id)
                           ON DELETE SET NULL
);

-- =====================================
--  EVENTS (Domain Event Log)
-- =====================================
CREATE TABLE events (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    entity_id  VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE docks ADD COLUMN version BIGINT DEFAULT 0;

