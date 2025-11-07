package com.thinkvision.backend.applicationLayer.prc;

import com.thinkvision.backend.entity.Trip;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile({"dev","test","local"})
@Primary
public class MockPaymentService implements PaymentService{

    @Override
    public boolean processPayment(Trip trip, double amount) {
        // deterministic mock: accept small amounts, decline large ones (example)
        System.out.println("MockPaymentService: processing payment for trip=" + trip.getId() + " amount=" + amount);
        return amount <= 1000.0;
    }
}
