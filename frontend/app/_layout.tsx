import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';
import { StationProvider } from '../contexts/StationContext';

export default function RootLayout() {
  return (
    <StationProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
      </AuthProvider>
    </StationProvider>
  );
}