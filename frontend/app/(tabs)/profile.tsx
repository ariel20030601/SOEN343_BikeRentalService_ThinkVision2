import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';


export default function ProfileScreen() {

  const user = null; // Replace with authentication later

  useEffect(() => {
    if (!user) {
      router.replace('/(tabs)/login'); 
    }
  }, [user]);
  

  return (
    <Text> Welcome to your profile! </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
});