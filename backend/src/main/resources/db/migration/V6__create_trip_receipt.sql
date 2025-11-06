-- sql
CREATE TABLE trip_receipts (
  id BIGINT NOT NULL AUTO_INCREMENT,
  trip_id BIGINT NOT NULL,
  user_id INT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  bike_id VARCHAR(50) NOT NULL,
  start_station_id VARCHAR(50) NOT NULL,
  end_station_id VARCHAR(50) NOT NULL,
  fare FLOAT(50) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_trip_receipts_trip_id (trip_id),
  KEY idx_trip_receipts_user_id (user_id),
  CONSTRAINT fk_trip_receipt_trip FOREIGN KEY (trip_id)
    REFERENCES trips (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_trip_receipt_user FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_trip_receipt_bike FOREIGN KEY (bike_id)
    REFERENCES bikes (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_trip_receipt_start_station FOREIGN KEY (start_station_id)
    REFERENCES stations (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_trip_receipt_end_station FOREIGN KEY (end_station_id)
    REFERENCES stations (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
)
