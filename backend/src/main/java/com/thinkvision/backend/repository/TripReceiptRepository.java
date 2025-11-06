package com.thinkvision.backend.repository;

import com.thinkvision.backend.entity.TripReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripReceiptRepository extends JpaRepository<TripReceipt, Long> {

    Optional<TripReceipt> findByTripId(Long tripId);
    // query receipts for a given user, most recent first
    List<TripReceipt> findAllByUserIdOrderByStartDateDesc(Integer userId);
}
