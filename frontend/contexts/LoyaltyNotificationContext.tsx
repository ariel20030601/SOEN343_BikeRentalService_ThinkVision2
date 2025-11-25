import React, { createContext, useContext, useState, ReactNode } from 'react';
import TierNotification from '../components/TierNotification';

type LoyaltyNotification = {
  from: string;
  to: string;
  visual?: boolean;
};

type LoyaltyNotificationContextType = {
  notifyTierChange: (p: LoyaltyNotification) => void;
};

const LoyaltyNotificationContext = createContext<LoyaltyNotificationContextType>({
  notifyTierChange: () => {},
});

export function useLoyaltyNotification() {
  return useContext(LoyaltyNotificationContext);
}

export function LoyaltyNotificationProvider({ children }: { children: ReactNode }) {
  const [popup, setPopup] = useState<{
    to: string;
    visible: boolean;
  }>({ to: 'GOLD', visible: false });

  const notifyTierChange = (p: LoyaltyNotification) => {
    console.log("[Loyalty Provider] Processing tier change", {
        from: p.from,
        to: p.to,
        visual: p.visual,
    });

    if (p.visual) {
        console.log("[Loyalty Provider] Showing popup for tier:", p.to);
        setPopup({ to: p.to, visible: true });
    } else {
        console.log("[Loyalty Provider] Visual flag is false — no popup shown");
    }
    };


  return (
    <LoyaltyNotificationContext.Provider value={{ notifyTierChange }}>
      {children}

      {popup.visible && (
        <TierNotification
            tier={popup.to}
            visible={popup.visible}
            onHide={() => {
                console.log("[TierNotification] Popup finished hiding for tier:", popup.to);
                setPopup((prev) => ({ ...prev, visible: false }));
            }}
        />
      )}
    </LoyaltyNotificationContext.Provider>
  );
}
