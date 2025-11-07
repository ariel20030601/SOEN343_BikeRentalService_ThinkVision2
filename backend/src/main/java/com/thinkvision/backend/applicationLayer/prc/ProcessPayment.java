package com.thinkvision.backend.applicationLayer.prc;


import com.thinkvision.backend.applicationLayer.dto.ProcessPaymentEvent;
import com.thinkvision.backend.entity.Trip;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class ProcessPayment {

    private static final Logger log = LoggerFactory.getLogger(ProcessPayment.class);

    private final PaymentService paymentService;

    public ProcessPayment(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @EventListener
    public void processPayment(ProcessPaymentEvent event) {
        Trip trip = event.getTrip();
        double cost = event.getCost();
        log.info("ProcessPayment: processing payment for trip={} amount={}", trip.getId(), cost);
        boolean success = paymentService.processPayment(trip, cost);
        if (success) {
            log.info("ProcessPayment: payment succeeded for trip={}", trip.getId());
        } else {
            log.warn("ProcessPayment: payment failed for trip={} amount={}", trip.getId(), cost);
            // handle retry/persist pending as needed
        }
    }
}
