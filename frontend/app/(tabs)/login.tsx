import { router } from 'expo-router';
import React, { useState } from 'react';
import { Button, StyleSheet, TextInput, View, Text, Alert } from 'react-native';
import { login } from "@/api/auth/loginAPI";
import { useAuth } from '@/contexts/AuthContext';

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: '#fff', 
  },
  TextInput: {
    width: '100%', 
    maxWidth: 800, 
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 12,
    backgroundColor: 'rgb(241, 90, 41)',
  },
});

export default function LogIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useAuth();

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login({ username, password });
      
      // Store auth data in context
      await authLogin({ username }, response.token);
      
      // Navigate to home page
      router.replace('/(tabs)');
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Login Failed', 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter username"
        value={username}
        onChangeText={setUsername}
        style={styles.TextInput}
        editable={!isLoading}
      />

      <TextInput
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.TextInput}
        editable={!isLoading}
      />
      
      <View style={styles.buttonContainer}>
        <Button 
          title={isLoading ? "Logging in..." : "Log In"} 
          onPress={handleSubmit}
          disabled={isLoading}
        />
      </View>
      
      <View style={{marginTop: 20}}>
        <Button 
          title="Don't have an account? Sign Up" 
          onPress={() => router.push('../signup')}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}