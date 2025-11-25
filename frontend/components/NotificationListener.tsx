import React, { useState } from 'react';
import useLoyaltyNotifications from 'hooks/useLoyaltyNotifications';
import { useLoyaltyNotification } from '@/contexts/LoyaltyNotificationContext';

export default function NotificationListener({ token, userId }: { token?: string; userId?: number }) {
  const [last, setLast] = useState<{ from: string; to: string } | null>(null);

  const { notifyTierChange } = useLoyaltyNotification();

  useLoyaltyNotifications(token, userId, (p) => {
    const from = String(p.from);
    const to = String(p.to);

    console.log("[Loyalty Event Received]", {
      userId,
      from,
      to,
      visual: p.visual,
    });

    setLast({ from, to });

    console.log("[Raw payload]", p);  // <-- Check the actual payload
    console.log("[Visual flag]", p.visual, typeof p.visual);  // <-- Check type
    notifyTierChange(p);
  });


  if (!token || !userId) return null;

  return (
    <div>
      {last ? `Last change: ${last.from} → ${last.to}` : 'Listening for loyalty notifications...'}
    </div>
  );
}
