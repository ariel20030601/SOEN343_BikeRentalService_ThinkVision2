import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

interface NotificationProps {
  tier: string;
  visible: boolean;
  onHide?: () => void;
}

export default function TierNotification({ tier, visible, onHide }: NotificationProps)  {
  // <-- FIX: These values must persist across renders
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -30, duration: 300, useNativeDriver: true }),
        ]).start(() => onHide?.());
      }, 2500);

      return () => clearTimeout(timeout);
    }
  },);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY }] }
      ]}
    >
      <Text style={styles.text}>🎉 Loyalty Tier Upgraded!</Text>
      <Text style={styles.tierText}>You are now {tier} Tier 🎖️</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    zIndex: 9999,
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
});
