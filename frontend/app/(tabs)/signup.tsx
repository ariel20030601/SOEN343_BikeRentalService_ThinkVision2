import React, { useState } from 'react';
import { router } from 'expo-router';
import { Button, StyleSheet, TextInput, View, Modal, Text } from 'react-native';
import CreditCardScreen from '../../components/CreditCardScreen';


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
        const [error, setError] = useState('');   

        const handleSubmit = () => {
            console.log('Email:', email);
            console.log('Username:', username);
            console.log('Password:', password);
            console.log('First Name:', firstName);
            console.log('Last Name:', lastName);
            console.log('Address:', address);
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
                    placeholder="Enter email"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (!validator.isEmail(text)) {
                            setError('Invalid email');
                            } else {
                            setError('');
                        }
                    }}
                    style={styles.TextInput}>
            </TextInput>
            {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}

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
                    value={username}
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
                <Button title="Log In" onPress={handleSubmit} />
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