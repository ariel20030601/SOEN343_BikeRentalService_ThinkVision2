package com.thinkvision.backend.controller;

import com.thinkvision.backend.applicationLayer.dto.TripSummaryDTO;
import com.thinkvision.backend.applicationLayer.prc.PricingPlan;
import com.thinkvision.backend.applicationLayer.prc.PricingService;
import com.thinkvision.backend.applicationLayer.prc.SummaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping ("/api/prc")
@CrossOrigin(origins = "*")
public class PRCController {

    @Autowired
    private PricingService pricingService;
    private SummaryService summaryService;

    @GetMapping ("/getPricingPlans")
    public List<PricingPlan> getPricingPlans() {
        return pricingService.getAllPricingPlans();
    }

    @GetMapping("/summary/{tripId}")
    public ResponseEntity<TripSummaryDTO> getSummary(@PathVariable Long tripId) {
        return summaryService.getSummary(tripId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
