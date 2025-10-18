import { router } from 'expo-router';
import React, { useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';
import {login} from "@/api/auth/api";


export default function LogIn() {

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
            const [username, setUsername] = useState('');
            const [password, setPassword] = useState('');
    
            const handleSubmit = () => {
                console.log('Username:', username);
                console.log('Password:', password);
                try {
                    const user = login({ username, password });
                    // Handle success (e.g., navigate to login or profile)
                } catch (error) {
                    console.log('Login error:', error);
                    // Handle error (e.g., show error message)
                }
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
                    <Button title="Don't have an account? Sign Up" onPress={() => router.push('../signup')} />
                </View>
            </View>
        )
}