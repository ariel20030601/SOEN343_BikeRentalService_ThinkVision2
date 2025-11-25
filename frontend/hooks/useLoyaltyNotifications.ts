import { useEffect } from 'react';
import { notificationClient, LoyaltyPayload } from '@/api/auth/notificationClient';

export default function useLoyaltyNotifications(
  token?: string,
  userId?: number,
  onNotification?: (p: LoyaltyPayload) => void
) {
  useEffect(() => {
    if (!token || !userId) return;

    const handler = (p: LoyaltyPayload) => {
      try { onNotification && onNotification(p); } catch (e) { console.error(e); }
    };

    notificationClient.connect(token, userId, handler);
    return () => { notificationClient.disconnect(); };
  }, [token, userId, onNotification]);
}