import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { StationProvider } from '../contexts/StationContext';
import { LoyaltyNotificationProvider } from '../contexts/LoyaltyNotificationContext';

export default function RootLayout() {
  return (
    <LoyaltyNotificationProvider>
      <StationProvider>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="dark" />
        </AuthProvider>
      </StationProvider>
    </LoyaltyNotificationProvider>
  );
}