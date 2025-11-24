package com.thinkvision.backend.applicationLayer.loyalty;

import com.thinkvision.backend.entity.*;
import com.thinkvision.backend.repository.ReservationRepository;
import com.thinkvision.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.temporal.TemporalAdjusters;
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

    @Transactional
    public void evaluateAndApplyTier(User user) {
        System.out.println("LoyaltyService: evaluateAndApplyTier called for user id=" +
                safeGetId(user) + ", username=" + safeGetUsername(user));

        LoyaltyTier oldTier = user.getLoyaltyTier() == null ? LoyaltyTier.NONE : user.getLoyaltyTier();
        LoyaltyTier newTier = determineTier(user);

        System.out.println("LoyaltyService: oldTier=" + oldTier + ", newTier=" + newTier);

        if (newTier != oldTier) {
            System.out.println("LoyaltyService: tier change detected, updating user...");
            user.setLoyaltyTier(newTier);
            userRepository.save(user);
            boolean visual = newTier.ordinal() > oldTier.ordinal();
            try {
                notificationService.notifyTierChange(user, oldTier, newTier, visual);
                System.out.println("LoyaltyService: notification sent (visual=" + visual + ")");
            } catch (Exception ex) {
                System.out.println("LoyaltyService: failed to send notification: " + ex.getMessage());
                ex.printStackTrace(System.out);
            }
        } else {
            System.out.println("LoyaltyService: no tier change for user.");
        }
    }

    public LoyaltyTier determineTier(User user) {
        Instant now = Instant.now();
        Instant oneYearAgo = now.minus(Duration.ofDays(365));

        long missedCount = reservationRepository
                .countByRiderAndStatusAndReservedAtAfter(user, ReservationStatus.MISSED, oneYearAgo);
        boolean br001_noMissedLastYear = missedCount == 0;
        System.out.println("determineTier: missedCountLastYear=" + missedCount + " -> br001_noMissedLastYear=" + br001_noMissedLastYear);

        List<ReservationStatus> claimStates = Arrays.asList(ReservationStatus.CLAIMED);
        long inProgressClaimed = reservationRepository.countByRiderAndStatusInAndReservedAtAfter(user, claimStates, Instant.EPOCH);
        boolean br002_allReturned = inProgressClaimed == 0;
        System.out.println("determineTier: inProgressClaimedTotal=" + inProgressClaimed + " -> br002_allReturned=" + br002_allReturned);

        // IMPORTANT: count RETURNED using returnedAt between oneYearAgo and now
        long returnedLastYear = reservationRepository.countByRiderAndStatusAndReturnedAtBetween(user, ReservationStatus.RETURNED, oneYearAgo, now);
        boolean br003_over10Trips = returnedLastYear > 10;
        System.out.println("determineTier: returnedLastYear=" + returnedLastYear + " -> br003_over10Trips=" + br003_over10Trips);

        if (br001_noMissedLastYear && br002_allReturned && br003_over10Trips) {
            boolean silverEligible = checkSilver(user, now);
            System.out.println("determineTier: bronze passed, silverEligible=" + silverEligible);
            if (silverEligible) {
                boolean goldEligible = checkGold(user, now);
                System.out.println("determineTier: silver passed, goldEligible=" + goldEligible);
                return goldEligible ? LoyaltyTier.GOLD : LoyaltyTier.SILVER;
            } else {
                return LoyaltyTier.BRONZE;
            }
        } else {
            System.out.println("determineTier: not eligible for Bronze (br001=" + br001_noMissedLastYear +
                    ", br002=" + br002_allReturned + ", br003=" + br003_over10Trips + ")");
            return LoyaltyTier.NONE;
        }
    }

    private boolean checkSilver(User user, Instant now) {
        Instant oneYearAgo = now.minus(Duration.ofDays(365));

        // SL-002: count reservations that were actually RETURNED in the last year
        long returnedCountLastYear = reservationRepository.countByRiderAndStatusAndReturnedAtBetween(user, ReservationStatus.RETURNED, oneYearAgo, now);
        boolean sl002 = returnedCountLastYear >= 5;
        System.out.println("checkSilver: returnedCountLastYear=" + returnedCountLastYear + " -> sl002=" + sl002);

        boolean sl003 = true;
        ZonedDateTime zNow = ZonedDateTime.ofInstant(now, ZoneId.systemDefault());
        for (int i = 0; i < 3; i++) {
            YearMonth ym = YearMonth.from(zNow.minusMonths(i));
            LocalDateTime start = ym.atDay(1).atStartOfDay();
            LocalDateTime end = ym.atEndOfMonth().atTime(LocalTime.MAX);
            Instant from = start.atZone(ZoneId.systemDefault()).toInstant();
            Instant to = end.atZone(ZoneId.systemDefault()).toInstant();
            // Use returnedAtBetween for monthly RETURNED counts
            long returnedCount = reservationRepository.countByRiderAndStatusAndReturnedAtBetween(user, ReservationStatus.RETURNED, from, to);
            System.out.println("checkSilver: month=" + ym + " returnedCount=" + returnedCount);
            // SL-003: "surpassed 5 trips per month" -> require > 5 (i.e. at least 6)
            if (returnedCount <= 5) {
                sl003 = false;
                System.out.println("checkSilver: month " + ym + " failed sl003 (returnedCount <= 5)");
                break;
            }
        }

        System.out.println("checkSilver: sl002=" + sl002 + ", sl003=" + sl003 + " -> silverEligible=" + (sl002 && sl003));
        return sl002 && sl003;
    }

    /**
     * Gold eligibility:
     * - Must already meet Silver criteria (handled by caller)
     * - Must surpass 5 returned trips every week for the last 3 months (13 calendar weeks)
     */
    private boolean checkGold(User user, Instant now) {
        ZonedDateTime zNow = ZonedDateTime.ofInstant(now, ZoneId.systemDefault());
        for (int i = 0; i < 13; i++) {
            ZonedDateTime reference = zNow.minusWeeks(i);
            // get Monday of that week (calendar week)
            LocalDate weekStartDate = reference.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).toLocalDate();
            LocalDate weekEndDate = weekStartDate.plusDays(6);
            LocalDateTime startLdt = weekStartDate.atStartOfDay();
            LocalDateTime endLdt = weekEndDate.atTime(LocalTime.MAX);
            Instant from = startLdt.atZone(ZoneId.systemDefault()).toInstant();
            Instant to = endLdt.atZone(ZoneId.systemDefault()).toInstant();

            long returnedCount = reservationRepository.countByRiderAndStatusAndReturnedAtBetween(user, ReservationStatus.RETURNED, from, to);
            System.out.println("checkGold: weekStart=" + weekStartDate + " returnedCount=" + returnedCount);
            if (returnedCount <= 5) {
                System.out.println("checkGold: failed for week starting " + weekStartDate + " (returnedCount <= 5)");
                return false;
            }
        }
        System.out.println("checkGold: passed all weeks -> goldEligible=true");
        return true;
    }

    private String safeGetUsername(User user) {
        try {
            return user.getUsername();
        } catch (Exception ex) {
            return "<unknown>";
        }
    }

    private String safeGetId(User user) {
        try {
            Object id = user.getId();
            return id == null ? "<null>" : String.valueOf(id);
        } catch (Exception ex) {
            return "<unknown>";
        }
    }
}
