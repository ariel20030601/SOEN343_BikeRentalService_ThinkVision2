import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button } from 'react-native';

type CreditCardScreenProps = {
  onSubmit: (paymentInfo: string) => void;
  onCancel: () => void;
};

export default function CreditCardScreen({ onSubmit, onCancel }: CreditCardScreenProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  function validate() {
    if (cardNumber.length < 13 || cardNumber.length > 19 || !/^\d+$/.test(cardNumber)) {
      alert('Invalid card number');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      alert('Expiry must be MM/YY');
      return false;
    }
    if (cvv.length < 3 || cvv.length > 4 || !/^\d+$/.test(cvv)) {
      alert('Invalid CVV');
      return false;
    }
    return true;
  }

  const handlePaymentSubmit = () => {
    if (validate()) {
      const paymentInfo = `${cardNumber}|${expiry}|${cvv}`;
      onSubmit(paymentInfo);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Credit Card Info</Text>
      <TextInput
        placeholder="Card Number"
        keyboardType="numeric"
        value={cardNumber}
        onChangeText={setCardNumber}
        style={styles.input}
        maxLength={19}
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
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignSelf: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  submitButton: { padding: 12, borderRadius: 5, marginTop: 10, marginBottom: 5 },
  cancelButton: { padding: 10 },
});