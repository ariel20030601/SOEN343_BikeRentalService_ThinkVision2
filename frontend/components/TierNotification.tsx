import React, { useEffect, useState } from 'react';

interface NotificationProps {
  tier: string;
  visible: boolean;
  onHide?: () => void;
  isUpgrade?: boolean; // New prop to determine if it's an upgrade or downgrade
}

export default function TierNotification({ tier, visible, onHide, isUpgrade = true }: NotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      // Trigger enter animation
      setIsAnimating(true);

      // Auto-hide after 5 seconds
      const timeout = setTimeout(() => {
        setIsAnimating(false);
        
        // Wait for exit animation to complete before calling onHide
        setTimeout(() => {
          onHide?.();
        }, 300);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [visible, onHide]);

  // Get tier color based on tier name
  const getTierColor = (tierName: string): string => {
    const normalizedTier = tierName.toUpperCase();
    switch (normalizedTier) {
      case 'BRONZE':
        return '#CD7F32'; // Bronze color
      case 'SILVER':
        return '#C0C0C0'; // Silver color
      case 'GOLD':
        return '#FFD700'; // Gold color
      default:
        return '#2196F3'; // Default blue
    }
  };

  if (!visible) return null;

  return (
    <div
      className={`tier-notification ${isAnimating ? 'tier-notification-enter' : 'tier-notification-exit'}`}
      style={styles.container}
    >
      <div style={styles.title}>
        {isUpgrade ? '🎉 Loyalty Tier Upgraded!' : '⚠️ Loyalty Tier Downgraded'}
      </div>
      
      <div style={styles.divider} />
      
      <div style={styles.tierRow}>
        <span style={styles.label}>
          {isUpgrade ? 'New Tier:' : 'Current Tier:'}
        </span>
        <span style={{...styles.tierValue, color: getTierColor(tier)}}>
          {tier} {isUpgrade ? '🏆' : '📉'}
        </span>
      </div>

      <style>{`
        .tier-notification {
          position: fixed;
          top: 120px;
          left: 50%;
          transform: translate(-50%, -30px);
          opacity: 0;
          transition: all 0.3s ease-out;
          z-index: 9999;
        }

        .tier-notification-enter {
          opacity: 1;
          transform: translate(-50%, 0);
        }

        .tier-notification-exit {
          opacity: 0;
          transform: translate(-50%, -30px);
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    minWidth: 320,
    maxWidth: 400,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 12,
  },
  tierRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  tierValue: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
};