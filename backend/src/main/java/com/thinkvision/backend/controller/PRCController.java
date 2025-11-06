package com.thinkvision.backend.controller;

import com.thinkvision.backend.applicationLayer.dto.TripSummaryDTO;
import com.thinkvision.backend.applicationLayer.prc.BillingHistoryService;
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
    @Autowired
    private SummaryService summaryService;
    @Autowired
    private BillingHistoryService billingHistoryService;

    @GetMapping ("/getPricingPlans")
    public List<PricingPlan> getPricingPlans() {
        return pricingService.getAllPricingPlans();
    }

    @GetMapping("/summary")
    public ResponseEntity<TripSummaryDTO> getSummary(@RequestParam(name="tripId") Long tripId) {
        return summaryService.getSummary(tripId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/history/{userId}")
    public List<TripSummaryDTO> getHistory(@PathVariable Integer userId) {
        return billingHistoryService.getBillingHistoryForUser(userId);
    }
}
