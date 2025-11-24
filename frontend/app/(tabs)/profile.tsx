import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F1',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#555',
  },
  value: {
    fontSize: 18,
    marginBottom: 14,
    color: '#222',
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#D9D7F1',
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  badgeText: {
    color: '#4A3AFF',
    fontWeight: '600',
    fontSize: 16,
  },
  roleToggle: {
    flexDirection: 'row',
    marginVertical: 15,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#ddd',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#4A90E2',
  },
  roleText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  roleTextActive: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: '#F15A29',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 40,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default function ProfileScreen() {
  const { user, logout, isLoading} = useAuth();

  const flexDollars = (user as any)?.flexDollars ?? 0;
  const loyaltyTier = (user as any)?.loyaltyTier ?? 'Entry'; 


  useFocusEffect(
    useCallback(() => {
      if (!isLoading && !user) {
        router.replace('/(tabs)/login');
      }
    }, [user, isLoading])
  );

  const handleSignOut = () => {
    logout()
      .then(() => router.replace('/(tabs)/login'))
      .catch((error) => console.error('Error signing out:', error));
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Account</Text>

      <Text style={styles.label}>Username</Text>
      <Text style={styles.value}>{user.username}</Text>

      <Text style={styles.label}>Loyalty Tier</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{loyaltyTier || 'Entry'}</Text>
      </View>

      <Text style={styles.label}>Flex Dollars</Text>
      <Text style={styles.value}>${flexDollars ?? 0}</Text>
      

      {/* Sign Out */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        activeOpacity={0.8}
      >
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
