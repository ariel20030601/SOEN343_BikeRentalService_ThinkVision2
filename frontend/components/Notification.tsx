import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface NotificationProps {
  message: string;
  visible: boolean;
  onHide?: () => void;
}

export default function Notification({ message, visible, onHide }: NotificationProps)  {
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(-30);

  useEffect(() => {
    if (visible) {
      // Slide down + fade in
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      // Auto-hide after 2.5 seconds
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -30, duration: 300, useNativeDriver: true }),
        ]).start(() => onHide?.());
      }, 2500);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY }] }
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    zIndex: 9999,
  },
  text: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});
