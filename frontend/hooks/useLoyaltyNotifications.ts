import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const LYT_API_URL = "http://localhost:8080/api/loyalty";

// Define tier hierarchy (NONE is 0, lowest tier)
const TIER_HIERARCHY: Record<string, number> = {
  'NONE': 0,
  'BRONZE': 1,
  'SILVER': 2,
  'GOLD': 3,
};

export function useTierCheck() {
  const { user, token, updateTier } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [newTier, setNewTier] = useState<string | null>(null);
  const [isUpgrade, setIsUpgrade] = useState(true);

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
        console.error('No computedTier field in response:', data);
        return null;
      }

      const currentTier = user.loyalty_tier || 'NONE';
      const normalizedCurrentTier = currentTier.toUpperCase();
      const normalizedFetchedTier = fetchedTier.toUpperCase();

      console.log('DEBUG - Current tier:', normalizedCurrentTier);
      console.log('DEBUG - Fetched tier:', normalizedFetchedTier);

      // Compare with current tier (case-insensitive)
      if (normalizedFetchedTier !== normalizedCurrentTier) {
        // Determine if upgrade or downgrade
        const currentRank = TIER_HIERARCHY[normalizedCurrentTier] ?? 0;
        const newRank = TIER_HIERARCHY[normalizedFetchedTier] ?? 0;
        
        console.log('DEBUG - Current rank:', currentRank);
        console.log('DEBUG - New rank:', newRank);
        
        const tierIsUpgrade = newRank > currentRank;
        
        console.log('DEBUG - Is upgrade?', tierIsUpgrade);
        console.log(tierIsUpgrade 
          ? `🎉 Tier upgraded: ${currentTier} → ${fetchedTier}`
          : `⚠️ Tier downgraded: ${currentTier} → ${fetchedTier}`
        );
        
        // Set state in correct order
        setIsUpgrade(tierIsUpgrade);
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
    isUpgrade,
    checkTier,
    hideNotification,
  };
}