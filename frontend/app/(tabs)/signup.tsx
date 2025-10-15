import React, { useState } from 'react';
import { router } from 'expo-router';
import { Button, StyleSheet, TextInput, View, Modal, Text } from 'react-native';
import CreditCardScreen from '../../components/CreditCardScreen';
import { register } from '../../api/auth/api';


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
        const validator = require('validator');
        const [modalVisible, setModalVisible] = useState(false);
        const [email, setEmail] = useState('');
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [firstName, setFirstName] = useState('');
        const [lastName, setLastName] = useState('');
        const [address, setAddress] = useState('');    
        const [Emailerror, setEmailError] = useState('');
        const [error, setError] = useState('');   

        const handleSubmit = () => {
            console.log('Email:', email);
            console.log('Username:', username);
            console.log('Password:', password);
            console.log('First Name:', firstName);
            console.log('Last Name:', lastName);
            console.log('Address:', address);
            try {
                const user = register({ username, email, password });
                // Handle success (e.g., navigate to login or profile)
            } catch (error) {
                console.log('Registration error:', error);
                // Handle error (e.g., show error message)
            }
        };

        const handlePaymentSubmit = () => {
            setModalVisible(false);
        };

        
        return (
        <View style={styles.container}>
            {modalVisible && (
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <CreditCardScreen 
                    onSubmit={handlePaymentSubmit} 
                    onCancel={() => setModalVisible(false)} />
            </Modal>
            )}
            <TextInput
                    placeholder="Enter username"
                    value={username}
                    onChangeText={(text) => {
                        setUsername(text);
                        if (text == ('Nasib')) {
                            setError('Username already taken');
                            } else {
                            setError('Username is available');
                        }
                    }}
                    style={styles.TextInput}>
            </TextInput>
            {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
            <TextInput
                    placeholder="Enter email"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (!validator.isEmail(text)) {
                            setEmailError('Invalid email');
                            } else {
                            setEmailError('');
                        }
                    }}
                    style={styles.TextInput}>
            </TextInput>
            {Emailerror ? <Text style={{ color: 'red' }}>{Emailerror}</Text> : null}

            <TextInput
                    placeholder="Enter first name"
                    value={firstName}
                    onChangeText={setFirstName}
                    style={styles.TextInput}>
            </TextInput>

            <TextInput
                    placeholder="Enter last name"
                    value={lastName}
                    onChangeText={setLastName}
                    style={styles.TextInput}>
            </TextInput>

            <TextInput
                    placeholder="Enter your address"
                    value={address}
                    onChangeText={setAddress}
                    style={styles.TextInput}>
            </TextInput>

            <TextInput
                    placeholder="Enter password"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.TextInput}>
            </TextInput>
            <View style={styles.buttonContainer}>
                <Button title="SignUp" onPress={handleSubmit} />
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Credit Card Info" onPress={() => setModalVisible(true)} />
            </View>
            <View style={{marginTop: 20}}>
                <Button title="Already have an account? Log In" onPress={() => router.push('../login')} />
            </View>
        </View>
        )
}