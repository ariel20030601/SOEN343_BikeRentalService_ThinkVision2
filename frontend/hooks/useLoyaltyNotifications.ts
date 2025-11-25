import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const LYT_API_URL = "http://localhost:8080/api/loyalty";

export function useTierCheck() {
  const { user, token, updateTier } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [newTier, setNewTier] = useState<string | null>(null);

  const checkTier = useCallback(async () => {
    if (!token || !user) {
      console.log('Skipping tier check: no token or user');
      return null;
    }

    try {
      const response = await fetch(`${LYT_API_URL}/${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Loyalty tier data fetched:', data);
      
      const fetchedTier = data.computedTier;
      
      if (!fetchedTier) {
        console.error('No loyaltyTier field in response:', data);
        return null;
      }

      const currentTier = user.loyalty_tier || 'BRONZE';

      // Compare with current tier (case-insensitive)
      if (fetchedTier.toUpperCase() !== currentTier.toUpperCase()) {
        console.log(`🎉 Tier upgraded: ${currentTier} → ${fetchedTier}`);
        setNewTier(fetchedTier);
        setShowNotification(true);
        await updateTier(fetchedTier);
        return fetchedTier;
      } else {
        console.log(`Tier unchanged: ${currentTier}`);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to check tier:', error);
      return null;
    }
  }, [token, user, updateTier]);

  const hideNotification = useCallback(() => {
    setShowNotification(false);
    setNewTier(null);
  }, []);

  return {
    showNotification,
    newTier: newTier || user?.loyalty_tier || 'NONE',
    checkTier,
    hideNotification,
  };
}