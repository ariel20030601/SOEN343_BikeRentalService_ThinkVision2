import { useAuth } from '@/contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import React, {useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function Index() {

  const { user } = useAuth();


  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>ThinkVision</Text>
        <Text style={styles.title}>Bike Rental Service</Text>

        <Text style={styles.lead}>
          Find, reserve, and ride shared bikes across the city. Fast unlock, secure
          payments, and operator tools when you need them.
        </Text>

        <View style={styles.features}>
          <Text style={styles.feature}>• Nearby stations & live availability</Text>
          <Text style={styles.feature}>• Reserve bikes & unlock with QR</Text>
          <Text style={styles.feature}>• Trip history and receipts</Text>
          <Text style={styles.feature}>• Operator dashboard and monitoring</Text>
        </View>
        <View style={styles.actions}>
          {!user ? (
            <>
              <TouchableOpacity style={styles.primary} onPress={() => router.push('/(tabs)/login')}>
                <Text style={styles.primaryText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondary} onPress={() => router.push('/(tabs)/signup')}>
                <Text style={styles.secondaryText}>Create account</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.primary} onPress={() => router.push('/(tabs)/profile')}>
              <Text style={styles.primaryText}>Profile Page</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.note}>Tip: Operators can log in to access the operator map.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const ORANGE = '#F15A29';
const LIGHT_ORANGE = '#FFECE4';

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: LIGHT_ORANGE },
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  brand: {
    color: ORANGE,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    color: '#333',
    marginBottom: 16,
  },
  lead: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  features: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 26,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  feature: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 18,
  },
  primary: {
    backgroundColor: ORANGE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  secondary: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ORANGE,
  },
  secondaryText: {
    color: ORANGE,
    fontWeight: '700',
    fontSize: 15,
  },
  note: {
    textAlign: 'center',
    color: '#666',
    marginTop: 12,
    fontSize: 13,
  },
});
