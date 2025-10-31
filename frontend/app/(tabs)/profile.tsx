import { useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
    color: '#333',
  },
  usernameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#F15A29',
  },
  signOutButton: {
    backgroundColor: '#F15A29',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();

  useEffect(() => {
    console.log('ProfileScreen - user:', user);
    console.log('ProfileScreen - isLoading:', isLoading);
    
    if (!isLoading && !user) {
      console.log('No user found, redirecting to login');
      router.replace('/(tabs)/login'); 
    }
  }, [user, isLoading]);

  const handleSignOut = () => {
    console.log('handleSignOut called!');
    
    if (window.confirm('Are you sure you want to sign out?')) {
      console.log('Sign out confirmed!');
      logout()
        .then(() => {
          console.log('Logout complete, navigating to login');
          router.replace('/(tabs)/login');
        })
        .catch((error) => {
          console.error('Error signing out:', error);
        });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to your profile!</Text>
      <Text style={styles.usernameText}>{user.username}</Text>
      
      <TouchableOpacity 
        style={styles.signOutButton} 
        onPress={handleSignOut}
        activeOpacity={0.7}
      >
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}