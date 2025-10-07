import React, { useState } from 'react';
import { router } from 'expo-router';
import { Button, StyleSheet, TextInput, View } from 'react-native';


export default function SignUp() {

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
        const [email, setEmail] = useState('');
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');

        const handleSubmit = () => {
            console.log('Email:', email);
            console.log('Username:', username);
            console.log('Password:', password);
        };
        
        return (
        <View style={styles.container}>
            <TextInput
                    placeholder="Enter email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.TextInput}>
            </TextInput>

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
            <Button title="Log In" onPress={handleSubmit} />
            </View>
            <View style={{marginTop: 20}}>
                <Button title="Already have an account? Log In" onPress={() => router.push('../login')} />
            </View>
        </View>
        )
}