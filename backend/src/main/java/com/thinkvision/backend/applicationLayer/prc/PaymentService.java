package com.thinkvision.backend.applicationLayer.prc;

import com.thinkvision.backend.entity.Trip;

public interface PaymentService {
    boolean processPayment(Trip trip, double amount);
}
