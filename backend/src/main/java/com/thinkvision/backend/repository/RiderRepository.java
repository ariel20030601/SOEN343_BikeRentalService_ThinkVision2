package com.thinkvision.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thinkvision.backend.entity.Rider;

@Repository
public interface RiderRepository extends JpaRepository<Rider, String> {
    Optional<Rider> findByUsername(String username);
}
