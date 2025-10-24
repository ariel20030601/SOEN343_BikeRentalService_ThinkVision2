package com.thinkvision.backend.controller;

import com.thinkvision.backend.applicationLayer.bms.*;
import com.thinkvision.backend.entity.Reservation;
import com.thinkvision.backend.entity.Trip;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bikes")
@CrossOrigin(origins = "*") // loosen for testing
public class BikeController {

    @Autowired
    ReservationService reservationService;
    @Autowired
    CheckoutService checkoutService;
    @Autowired
    ReturnService returnService;

    @PostMapping("/reserve")
    public Reservation reserveBike(@RequestBody ReserveRequest req) {
        System.out.println(">>> Reserve endpoint called with: " + req);
        return reservationService.reserveBike(req.riderId(), req.stationId(), req.bikeId());
    }

    @PostMapping("/checkout")
    public Trip checkoutBike(@RequestBody CheckoutRequest req) {
        return checkoutService.checkoutBike(req.riderId(), req.stationId(), req.bikeId());
    }

    @PostMapping("/return")
    public Trip returnBike(@RequestBody ReturnRequest req) {
        return returnService.returnBike(req.riderId(), req.stationId(), req.bikeId());
    }
}
