import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getBillingHistory, getTripSummary, TripSummaryDTO } from '../../api/auth/api';

export default function Billing() {
  const { user } = useAuth();
  const [unpaidTrips, setUnpaidTrips] = useState<TripSummaryDTO[]>([]);
  const [paidTrips, setPaidTrips] = useState<TripSummaryDTO[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripSummaryDTO | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    if (user?.id) {
      loadBillingData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadBillingData = async () => {
    try {
      setIsLoading(true);
      const history = await getBillingHistory(user.id);
      
      // Separate paid and unpaid trips (assuming trips without payment are unpaid)
      // You may need to adjust this logic based on your backend implementation
      const unpaid = history.filter(trip => !trip.paid); // Add 'paid' flag to TripSummaryDTO if needed
      const paid = history.filter(trip => trip.paid);
      
      setUnpaidTrips(unpaid);
      setPaidTrips(paid);
    } catch (error) {
      console.error('Error loading billing data:', error);
      Alert.alert('Error', 'Failed to load billing history');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = (trip: TripSummaryDTO) => {
    setSelectedTrip(trip);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedTrip) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentModal(false);
      setShowSuccessModal(true);

      // Move trip from unpaid to paid
      setUnpaidTrips(prev => prev.filter(t => t.tripId !== selectedTrip.tripId));
      setPaidTrips(prev => [{ ...selectedTrip, paid: true }, ...prev]);

      // Hide success message after 2 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        setSelectedTrip(null);
      }, 2000);
    }, 1500);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const injectTestTrip = () => {
    
    const start = new Date();
    const end = new Date(start.getTime() + 15 * 60 * 1000);
    const riderId = (user as any)?.id ?? 0;
    const testTrip: TripSummaryDTO = {
      tripId: Number(String(Date.now()).slice(-6)),
      riderId,
      bikeId: 'TEST-BIKE',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationMinutes: 15,
      cost: 3.5,
      pricingPlan: { name: 'Standard' },
      paid: false,
    } as any;

    setUnpaidTrips(prev => [testTrip, ...prev]);
    console.log('Inserted test trip:', testTrip);
    Alert.alert('Test Trip', `Inserted test trip #${testTrip.tripId}`);
    scrollRef.current?.scrollTo?.({ y: 0, animated: true });
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.loginPrompt}>
          <Ionicons name="lock-closed-outline" size={48} color="#999" />
          <Text style={styles.loginText}>Please log in to view billing information</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#F15A29" />
        <Text style={styles.loadingText}>Loading billing data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} ref={scrollRef}>
      <Text style={styles.title}>
        <Ionicons name="receipt-outline" size={28} color="#F15A29" /> Billing
      </Text>

      {/* Unpaid Trips / Trip Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trip Summary (Unpaid)</Text>
        {unpaidTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#4CAF50" />
            <Text style={styles.emptyText}>No pending payments</Text>
          </View>
        ) : (
          unpaidTrips.map((trip) => (
            <View key={trip.tripId} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripId}>Trip #{trip.tripId}</Text>
                <Text style={styles.tripCost}>${trip.cost?.toFixed(2) || '0.00'}</Text>
              </View>
              
              <View style={styles.tripDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="bicycle-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>Bike: {trip.bikeId || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>Duration: {formatDuration(trip.durationMinutes)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>Start: {formatDate(trip.startTime)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="flag-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>End: {formatDate(trip.endTime)}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.payButton}
                onPress={() => handlePayNow(trip)}
              >
                <Ionicons name="card-outline" size={18} color="#fff" />
                <Text style={styles.payButtonText}>Pay Now</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Billing History Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Billing History</Text>
        {paidTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>No billing history yet</Text>
          </View>
        ) : (
          paidTrips.map((trip) => (
            <View key={trip.tripId} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View>
                  <Text style={styles.historyId}>Trip #{trip.tripId}</Text>
                  <Text style={styles.historyDate}>{formatDate(trip.startTime)}</Text>
                </View>
                <View style={styles.paidBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.paidText}>Paid</Text>
                </View>
              </View>

              <View style={styles.historyDetails}>
                <View style={styles.historyRow}>
                  <Text style={styles.historyLabel}>Bike ID:</Text>
                  <Text style={styles.historyValue}>{trip.bikeId || 'N/A'}</Text>
                </View>
                <View style={styles.historyRow}>
                  <Text style={styles.historyLabel}>Duration:</Text>
                  <Text style={styles.historyValue}>{formatDuration(trip.durationMinutes)}</Text>
                </View>
                <View style={styles.historyRow}>
                  <Text style={styles.historyLabel}>Plan:</Text>
                  <Text style={styles.historyValue}>{trip.pricingPlan?.name || 'Standard'}</Text>
                </View>
                <View style={styles.historyRow}>
                  <Text style={styles.historyLabel}>Cost:</Text>
                  <Text style={styles.historyCost}>${trip.cost?.toFixed(2) || '0.00'}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Payment Confirmation</Text>
            
            {selectedTrip && (
              <>
                <View style={styles.paymentSummary}>
                  <Text style={styles.paymentLabel}>Trip #{selectedTrip.tripId}</Text>
                  <Text style={styles.paymentAmount}>${selectedTrip.cost?.toFixed(2) || '0.00'}</Text>
                </View>

                <View style={styles.paymentMethod}>
                  <Ionicons name="card" size={24} color="#F15A29" />
                  <View style={styles.paymentMethodText}>
                    <Text style={styles.paymentMethodTitle}>Payment Method</Text>
                    <Text style={styles.paymentMethodDetail}>
                      {user.paymentInfo || '**** **** **** 1234'}
                    </Text>
                    <Text style={styles.paymentMethodSubtext}>Default payment method</Text>
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowPaymentModal(false)}
                    disabled={isProcessing}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleConfirmPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color="#fff" />
                        <Text style={styles.confirmButtonText}>Confirm Payment</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={styles.successTitle}>Payment Confirmed!</Text>
            <Text style={styles.successMessage}>
              Your payment has been processed successfully
            </Text>
          </View>
        </View>
      </Modal>

      {/* Dev-only button to inject test trip */}
      {__DEV__ && (
        <TouchableOpacity style={styles.devBtn} onPress={injectTestTrip}>
          <Ionicons name="bug-outline" size={18} color="#fff" />
          <Text style={styles.devBtnText}>Insert Test Trip</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#F15A29',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tripCost: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F15A29',
  },
  tripDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  payButton: {
    flexDirection: 'row',
    backgroundColor: '#F15A29',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  historyDetails: {
    marginTop: 8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  historyLabel: {
    fontSize: 14,
    color: '#666',
  },
  historyValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  historyCost: {
    fontSize: 14,
    color: '#F15A29',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  paymentSummary: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F15A29',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  paymentMethodText: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  paymentMethodDetail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  paymentMethodSubtext: {
    fontSize: 12,
    color: '#999',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#F15A29',
    flexDirection: 'row',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  successModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  devBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9E9E9E',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 6,
  },
  devBtnText: { color: '#fff', fontWeight: 'bold' },
});