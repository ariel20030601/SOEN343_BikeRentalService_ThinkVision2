import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Button } from 'react-native';

type CreditCardScreenProps = {
  onSubmit: (cardInfo: { cardNumber: string; expiry: string; cvv: string }) => void;
  onCancel: () => void;
};

export default function CreditCardScreen({ onSubmit, onCancel }: CreditCardScreenProps) {
  const [modalVisible, setModalVisible] = useState(true);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePaymentSubmit = () => {
    console.log('Card Info:', { cardNumber, expiry, cvv });
    onSubmit({ cardNumber, expiry, cvv });
    setModalVisible(false);
  };



  return (
    <View style={styles.container}>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Credit Card Info</Text>
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              keyboardType="number-pad"
              value={cardNumber}
              onChangeText={setCardNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              value={expiry}
              onChangeText={setExpiry}
            />
            <TextInput
              style={styles.input}
              placeholder="CVV"
              keyboardType="number-pad"
              secureTextEntry
              value={cvv}
              onChangeText={setCvv}
            />
        <View style={styles.submitButton}>
            <Button title="Submit" onPress={handlePaymentSubmit} />
        </View>
        <View style={styles.cancelButton}>
            <Button title="Cancel" color="red" onPress={onCancel} />
        </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: { backgroundColor: 'orange', padding: 15, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  submitButton: {padding: 12, borderRadius: 5, marginTop: 10, marginBottom: 5 },
  submitText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  cancelButton: { padding: 10},
  cancelText: { textAlign: 'center', color: 'red' },
});