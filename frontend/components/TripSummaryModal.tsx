import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { TripSummaryDTO } from '@/api/auth/histAPI';
import { formatCurrency, formatDuration } from '@/utils/formatters';

interface TripSummaryModalProps {
  visible: boolean;
  tripSummary: TripSummaryDTO | null;
  onClose: () => void;
}

export default function TripSummaryModal({ 
  visible, 
  tripSummary, 
  onClose 
}: TripSummaryModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>🚴 Trip Summary</Text>
          
          <ScrollView style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Trip ID:</Text>
              <Text style={styles.summaryValue}>#{tripSummary?.tripId}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Bike Type:</Text>
              <Text style={styles.summaryValue}>
                {(tripSummary as any)?.bikeType === 'E_BIKE' ? '⚡ E-Bike' : '🚲 Standard'}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>From:</Text>
              <Text style={styles.summaryValue}>
                {(tripSummary as any)?.startStationName || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>To:</Text>
              <Text style={styles.summaryValue}>
                {(tripSummary as any)?.endStationName || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>
                {formatDuration(tripSummary?.durationMinutes)}
              </Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total Cost:</Text>
              <Text style={styles.summaryTotalValue}>
                {formatCurrency(tripSummary?.cost)}
              </Text>
            </View>
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.summaryButton}
            onPress={onClose}
          >
            <Text style={styles.summaryButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
   summaryContent: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  summaryButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  summaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})