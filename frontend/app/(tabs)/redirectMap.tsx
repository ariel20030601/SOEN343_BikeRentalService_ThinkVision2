import { useCallback } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';          

export default function redirectMap() {

const { user } = useAuth();

useFocusEffect(
  useCallback(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    const role = (user as any).role as string | undefined;
    const username = (user as any).username as string | undefined;

    if (role === 'operator' || (username && username.toLowerCase().includes('operator'))) {
      router.replace('/(tabs)/operatorMap');
    } else {
      router.replace('/(tabs)/riderMap');
    }
  }, [user])
);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}