import React, { useState } from 'react';
import useLoyaltyNotifications from 'hooks/useLoyaltyNotifications';

export default function NotificationListener({
  token,
  userId,
}: {
  token?: string;
  userId?: number;
}) {
  const [last, setLast] = useState<{ from: string; to: string } | null>(null);

  useLoyaltyNotifications(token, userId, (p) => {
    setLast({ from: String(p.from), to: String(p.to) });
    if (p.visual) {
      // replace with your toast/ui
      window.alert(`Loyalty tier changed: ${p.from} → ${p.to}`);
    }
  });

  if (!token || !userId) return null;
  return <div>{last ? `Last change: ${last.from} → ${last.to}` : 'Listening for loyalty notifications...'}</div>;
}