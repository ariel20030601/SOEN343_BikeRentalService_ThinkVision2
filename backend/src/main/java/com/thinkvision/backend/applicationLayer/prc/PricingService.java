package com.thinkvision.backend.applicationLayer.prc;

import com.thinkvision.backend.entity.BikeType;
import com.thinkvision.backend.entity.Trip;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class PricingService {

    @Autowired
    private EBikePlan ebikePlan;

    @Autowired
    private StandardPlan standardPlan;

    private final Map<BikeType, PricingPlan> catalog = new EnumMap<>(BikeType.class);

    @PostConstruct
    public void init() {
        // Populate catalog with metadata the front end can display.
        // Keep values in sync with the concrete PricingPlan implementations.
        catalog.put(BikeType.E_BIKE, ebikePlan);
        catalog.put(BikeType.STANDARD, standardPlan);
    }

    public List<PricingPlan> getAllPricingPlans() {
        return new ArrayList<>(catalog.values());
    }

}
