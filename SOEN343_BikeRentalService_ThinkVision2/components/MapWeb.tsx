import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapWeb() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map View</Text>
      <Text style={styles.subtext}>(Web maps coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});