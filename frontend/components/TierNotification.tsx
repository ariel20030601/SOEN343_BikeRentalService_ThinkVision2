import React, { useEffect, useState } from 'react';

interface NotificationProps {
  tier: string;
  visible: boolean;
  onHide?: () => void;
}

export default function TierNotification({ tier, visible, onHide }: NotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      // Trigger enter animation
      setIsAnimating(true);

      // Auto-hide after 2.5 seconds
      const timeout = setTimeout(() => {
        setIsAnimating(false);
        
        // Wait for exit animation to complete before calling onHide
        setTimeout(() => {
          onHide?.();
        }, 300);
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div
      className={`tier-notification ${isAnimating ? 'tier-notification-enter' : 'tier-notification-exit'}`}
      style={styles.container}
    >
      <div style={styles.text}>🎉 Loyalty Tier Upgraded!</div>
      <div style={styles.tierText}>You are now {tier} Tier 🎖️</div>

      <style>{`
        .tier-notification {
          position: fixed;
          top: 50px;
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
    backgroundColor: '#111',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 14,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  text: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  tierText: {
    color: '#FFC107',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  }
};