package com.thinkvision.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thinkvision.backend.entity.Station;

@Repository
public interface StationRepository extends JpaRepository<Station, String> {
    Optional<Station> findByCode(String code);
}
