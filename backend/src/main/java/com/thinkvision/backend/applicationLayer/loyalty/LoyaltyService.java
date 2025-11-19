package com.thinkvision.backend.applicationLayer.loyalty;

import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.ReservationRepository;
import com.thinkvision.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.Arrays;
import java.util.List;

@Service
public class LoyaltyService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public LoyaltyService(ReservationRepository reservationRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    /**
     * Evaluate and update a single user's tier. Call this on user login.
     */
    @Transactional
    public void evaluateAndApplyTier(User user) {
        LoyaltyTier oldTier = user.getLoyaltyTier() == null ? LoyaltyTier.NONE : user.getLoyaltyTier();
        LoyaltyTier newTier = determineTier(user);

        if (newTier != oldTier) {
            user.setLoyaltyTier(newTier);
            userRepository.save(user);
            boolean visual = newTier.ordinal() > oldTier.ordinal();
            notificationService.notifyTierChange(user, oldTier, newTier, visual);
        }
    }

    /**
     * Determine highest eligible tier for a user based on rules.
     */
    public LoyaltyTier determineTier(User user) {
        Instant now = Instant.now();
        Instant oneYearAgo = now.minus(Duration.ofDays(365));
        // Bronze checks
        boolean br001_noMissedLastYear = reservationRepository
                .countByRiderAndStatusAndReservedAtAfter(user, ReservationStatus.MISSED, oneYearAgo) == 0;

        // BR-002: returned all bikes that they ever took successfully
        // i.e., no reservation that is CLAIMED (started) and not RETURNED
        List<ReservationStatus> claimStates = Arrays.asList(ReservationStatus.CLAIMED);
        long inProgressClaimed = reservationRepository.countByRiderAndStatusInAndReservedAtAfter(user, claimStates, Instant.EPOCH);
        boolean br002_allReturned = inProgressClaimed == 0;

        long returnedLastYear = reservationRepository.countByRiderAndStatusAndReservedAtAfter(user, ReservationStatus.RETURNED, oneYearAgo);
        boolean br003_over10Trips = returnedLastYear > 10;

        if (br001_noMissedLastYear && br002_allReturned && br003_over10Trips) {
            // at least Bronze
            boolean silverEligible = checkSilver(user, now);
            return silverEligible ? LoyaltyTier.SILVER : LoyaltyTier.BRONZE;
        } else {
            return LoyaltyTier.NONE;
        }
    }

    private boolean checkSilver(User user, Instant now) {
        Instant oneYearAgo = now.minus(Duration.ofDays(365));
        // SL-002: at least 5 reservations of bikes successfully claimed within last year
        List<ReservationStatus> claimedOrReturned = Arrays.asList(ReservationStatus.CLAIMED, ReservationStatus.RETURNED);
        long claimedCount = reservationRepository.countByRiderAndStatusInAndReservedAtAfter(user, claimedOrReturned, oneYearAgo);
        boolean sl002 = claimedCount >= 5;

        // SL-003: surpassed 5 trips per month for last three months (i.e., >5 per month)
        boolean sl003 = true;
        ZonedDateTime zNow = ZonedDateTime.ofInstant(now, ZoneId.systemDefault());
        for (int i = 0; i < 3; i++) {
            YearMonth ym = YearMonth.from(zNow.minusMonths(i));
            LocalDateTime start = ym.atDay(1).atStartOfDay();
            LocalDateTime end = ym.atEndOfMonth().atTime(LocalTime.MAX);
            Instant from = start.atZone(ZoneId.systemDefault()).toInstant();
            Instant to = end.atZone(ZoneId.systemDefault()).toInstant();
            long returnedCount = reservationRepository.countByRiderAndStatusAndReservedAtBetween(user, ReservationStatus.RETURNED, from, to);
            if (returnedCount <= 5) { // must surpass 5
                sl003 = false;
                break;
            }
        }

        return sl002 && sl003;
    }
}

