ALTER TABLE users
    ADD COLUMN loyalty_tier VARCHAR(20) NOT NULL DEFAULT 'NONE';

ALTER TABLE reservations
    ADD COLUMN claimed_at TIMESTAMP,
  ADD COLUMN returned_at TIMESTAMP,
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'RESERVED';

-- Backfill status from existing data:
-- returned_at -> RETURNED
-- claimed_at and not returned -> CLAIMED
-- expired and not claimed -> MISSED
-- otherwise RESERVED
UPDATE reservations
SET status = CASE
                 WHEN returned_at IS NOT NULL THEN 'RETURNED'
                 WHEN claimed_at IS NOT NULL THEN 'CLAIMED'
                 WHEN expires_at < CURRENT_TIMESTAMP AND claimed_at IS NULL THEN 'MISSED'
                 ELSE 'RESERVED'
    END;

-- Optional: add a check constraint so only known statuses are stored.
ALTER TABLE reservations
    ADD CONSTRAINT chk_reservation_status
        CHECK (status IN ('RESERVED','CLAIMED','RETURNED','MISSED'));

-- Index to speed up the tier evaluation queries
CREATE INDEX idx_reservations_rider_status_reserved_at
    ON reservations (rider_id, status, reserved_at);
