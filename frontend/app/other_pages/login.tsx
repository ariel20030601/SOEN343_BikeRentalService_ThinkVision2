import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';


type LogInProps = {
  switchToSignUp: () => void;
};

export default function LogIn({ switchToSignUp }: LogInProps) {

    const router = useRouter();

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
                        },
                    });
            const [username, setUsername] = useState('');
            const [password, setPassword] = useState('');
    
            const handleSubmit = () => {
                console.log('Username:', username);
                console.log('Password:', password);
            };
            
            return (
            <View style={styles.container}>
                <TextInput
                        placeholder="Enter username"
                        value={username}
                        onChangeText={setUsername}
                        style={styles.TextInput}>
                </TextInput>
    
                <TextInput
                        placeholder="Enter password"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.TextInput}>
                </TextInput>
                <View style={styles.buttonContainer}>
                    <Button  title="Log In" onPress={handleSubmit} />
                </View>
                <View style={{marginTop: 20}}>
                    <Button title="Don't have an account? Sign Up" onPress={(switchToSignUp)} />
                </View>
            </View>
        )
}