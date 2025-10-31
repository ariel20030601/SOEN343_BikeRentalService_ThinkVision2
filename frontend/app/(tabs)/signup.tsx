import React, { useState } from 'react';
import { router } from 'expo-router';
import { Button, StyleSheet, TextInput, View, Modal, Text } from 'react-native';
import CreditCardScreen from '../../components/CreditCardScreen';
import { register, checkUsername } from '../../api/auth/api';


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
        const [paymentInfo, setPaymentInfo] = useState<string>('');

    const [Emailerror, setEmailError] = useState('');
    const [error, setError] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

        const handlePaymentSubmit = (paymentInfo: string) => {
            setPaymentInfo(paymentInfo)
            setModalVisible(false);
        };

        const handleSubmit = async () => {
            console.log('Email:', email);
            console.log('Username:', username);
            console.log('Password:', password);
            console.log('First Name:', firstName);
            console.log('Last Name:', lastName);
            console.log('Address:', address);
            console.log('Payment Info:', paymentInfo); 
            try {
                const user = await register({
                    username,
                    email,
                    password,
                    firstName,
                    lastName,
                    address,
                    paymentInfo
                });
                router.push('/(tabs)/login');
            } catch (err: any) {
                console.log('Registration error:', err);
                if (err?.status === 409) {
                    setError('Username already exists');
                } else {
                    setError(err?.message || 'Registration failed');
                }
            }
        };
 
        return (
        <View style={styles.container}>
            {modalVisible && (
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <CreditCardScreen 
                    onSubmit={handlePaymentSubmit} 
                    onCancel={() => setModalVisible(false)} />
                </View>
            </Modal>
            )}
            <TextInput
                    placeholder="Enter username"
                    value={username}
                    onChangeText={(text) => {
                        setUsername(text);
                        setUsernameAvailable(null);
                        setError('');
                    }}
                    onBlur={async () => {
                        if (!username) return;
                        try {
                            const available = await checkUsername(username);
                            setUsernameAvailable(available);
                            setError(available ? '' : 'Username already taken');
                        } catch (e: any) {
                            setError(e?.message || 'Could not verify username');
                            setUsernameAvailable(null);
                        }
                    }}
                    style={styles.TextInput}>
            </TextInput>
            {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
            {usernameAvailable === true ? <Text style={{ color: 'green' }}>Username is available</Text> : null}
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