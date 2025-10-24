package com.thinkvision.backend.controller;

import com.thinkvision.backend.applicationLayer.*;
import com.thinkvision.backend.entity.Reservation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bikes")
@CrossOrigin(origins = "*")
public class BikeController {

    @Autowired
    ReservationService reservationService;

    CheckoutBike checkoutBike;

    @PostMapping("/reserve")
    public Reservation reserveBike(@RequestBody ReserveRequest req) {
        return reservationService.reserveBike(req.riderId(), req.stationId(), req.bikeId());
    }

    @PostMapping("/checkout")
    public void checkoutBike(@RequestBody CheckoutRequest req) {
        checkoutBike.checkoutBike(req.riderId(), req.stationId(), req.bikeId());
    }

}

