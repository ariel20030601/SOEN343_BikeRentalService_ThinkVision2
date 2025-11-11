package com.thinkvision.backend.repository;

import com.thinkvision.backend.entity.Trip;
import com.thinkvision.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    Optional<Trip> findFirstByRiderAndBikeIdAndActiveTrue(User rider, String bikeId);
}

