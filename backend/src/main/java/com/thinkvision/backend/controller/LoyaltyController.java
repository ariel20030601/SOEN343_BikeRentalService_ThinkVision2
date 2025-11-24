package com.thinkvision.backend.controller;

import com.thinkvision.backend.applicationLayer.loyalty.LoyaltyService;
import com.thinkvision.backend.applicationLayer.loyalty.LoyaltyStatusDTO;
import com.thinkvision.backend.entity.LoyaltyTier;
import com.thinkvision.backend.entity.User;
import com.thinkvision.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loyalty")
@CrossOrigin(origins = "*")
public class LoyaltyController {

    @Autowired
    private LoyaltyService loyaltyService;

    @Autowired
    private UserRepository userRepository;

    // Require auth: return current user's stored + computed tier
    @GetMapping
    public ResponseEntity<?> getMyLoyalty(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(user -> ResponseEntity.ok(buildStatusDto(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Public: allow fetching by id without authentication
    @GetMapping("/{userId}")
    public ResponseEntity<?> getLoyaltyForUser(@PathVariable Integer userId) {
        return userRepository.findById(userId)
                .map(user -> ResponseEntity.ok(buildStatusDto(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Require auth when no userId provided; allow operator to pass userId
    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluateAndApply(@RequestParam(required = false) Integer userId,
                                              Authentication authentication) {
        User target;
        if (userId != null) {
            target = userRepository.findById(userId).orElse(null);
            if (target == null) return ResponseEntity.notFound().build();
        } else {
            if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
                return ResponseEntity.status(401).build();
            }
            target = userRepository.findByUsername(authentication.getName()).orElse(null);
            if (target == null) return ResponseEntity.status(401).build();
        }

        try {
            loyaltyService.evaluateAndApplyTier(target);
            User fresh = userRepository.findById(target.getId()).orElse(target);
            return ResponseEntity.ok(buildStatusDto(fresh));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "evaluation failed"));
        }
    }

    private LoyaltyStatusDTO buildStatusDto(User user) {
        LoyaltyTier current = user.getLoyaltyTier() == null ? LoyaltyTier.NONE : user.getLoyaltyTier();
        LoyaltyTier computed = loyaltyService.determineTier(user);
        LoyaltyTier effective = computed != null ? computed : current;
        return new LoyaltyStatusDTO(
                current.name(),
                computed.name(),
                effective.getDiscountPercent(),
                effective.getExtraHoldSeconds()
        );
    }
}
