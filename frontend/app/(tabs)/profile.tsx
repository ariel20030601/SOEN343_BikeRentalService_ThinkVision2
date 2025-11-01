import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';


export default function ProfileScreen() {

  const user = null; // Replace with authentication later

  useEffect(() => {
    if (!user) {
      router.replace('/(tabs)/login'); 
    }
  }, [user]);
  

  return (
    <View style={styles.container}>
      <Text style={styles.text}> Welcome to your profile! </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});