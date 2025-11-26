import React, { useState, useEffect } from 'react';
import { useTierCheck } from '@/hooks/useLoyaltyNotifications';
import { useLoyaltyNotification } from '@/contexts/LoyaltyNotificationContext';

export default function NotificationListener() {
  const [last, setLast] = useState<{ from: string; to: string } | null>(null);

  const { notifyTierChange } = useLoyaltyNotification();

  // Pull values directly from the hook instead of passing token/userId here
  const {
    checkTier
  } = useTierCheck();

  // Run the tier check once (or put inside useFocusEffect / interval)
  useEffect(() => {
    checkTier().then((updatedTier) => {
      if (!updatedTier) return;

      const from = last?.to ?? "UNKNOWN";
      const to = updatedTier;

      setLast({ from, to });

      const payload = {
        from,
        to,
      };

      console.log("[Loyalty Event Received]", payload);
      notifyTierChange(payload);
    });
  }, []); // run once

  return (
    <div>
      {last
        ? `Last change: ${last.from} → ${last.to}`
        : 'Listening for loyalty notifications...'}
    </div>
  );
}
