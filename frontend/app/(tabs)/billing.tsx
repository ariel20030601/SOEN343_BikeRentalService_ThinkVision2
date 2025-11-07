import { View, Text, StyleSheet } from 'react-native';

export default function Billing() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Billing Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F6F1',
  },
  text: {
    fontSize: 20,
  },
});