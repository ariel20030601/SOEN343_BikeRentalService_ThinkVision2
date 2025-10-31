DROP TABLE IF EXISTS reservations;

CREATE TABLE reservations (
                              id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
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