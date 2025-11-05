package com.thinkvision.backend.controller;

import com.thinkvision.backend.applicationLayer.prc.PricingPlan;
import com.thinkvision.backend.applicationLayer.prc.PricingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping ("/api/prc")
@CrossOrigin(origins = "*")
public class PRCController {

    @Autowired
    private PricingService pricingService;

    @GetMapping
    public List<PricingPlan> getPricingPlans() {
        return pricingService.getAllPricingPlans();
    }
}
