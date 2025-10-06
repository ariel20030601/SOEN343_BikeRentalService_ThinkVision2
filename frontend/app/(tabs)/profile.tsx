import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import LogIn from '../other_pages/login';
import SignUp from '../other_pages/signup';


export default function ProfileScreen() {

  const user = null; // Replace with actual auth state
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  if (!user) {
    if (authMode === 'login') {
      return <LogIn switchToSignUp={() => setAuthMode('signup')} />;
    } else {
      return <SignUp switchToLogIn={() => setAuthMode('login')} />;
    }
  }
  

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