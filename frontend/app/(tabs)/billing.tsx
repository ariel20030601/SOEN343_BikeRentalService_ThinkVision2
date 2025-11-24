import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal, Pressable, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { fetchAllUsers, User } from "@/api/auth/dashboardAPI";
import { fetchBillingHistory, TripSummary } from "@/api/auth/prcAPI";
import { useAuth } from "@/contexts/AuthContext";
import CreditCardScreen from "@/components/CreditCardScreen";

export default function History() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [selected, setSelected] = useState<TripSummary | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTripForPayment, setSelectedTripForPayment] = useState<TripSummary | null>(null);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Add paid trips tracking
  const [paidTrips, setPaidTrips] = useState<Set<string>>(new Set());

  const username = (user?.username as string) || "";

  // Memoize the trip selection to prevent unnecessary re-renders
  const handleTripSelect = React.useCallback((trip: TripSummary) => {
    setSelected(trip);
  }, []);

  // Handle payment initiation
  const handlePayNow = React.useCallback((trip: TripSummary) => {
    setSelectedTripForPayment(trip);
    setShowPaymentModal(true);
  }, []);

  // Handle existing card payment
  const handlePayWithExistingCard = async () => {
    if (!selectedTripForPayment) return;
    
    setPaymentProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark trip as paid instead of removing it
      setPaidTrips(prev => new Set(prev).add(selectedTripForPayment.tripId.toString()));
      
      Alert.alert('Payment Successful', `Payment of $${selectedTripForPayment.cost?.toFixed(2)} has been processed successfully.`);
      setShowPaymentModal(false);
      setSelectedTripForPayment(null);
    } catch (error) {
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Handle new card payment
  const handlePayWithNewCard = () => {
    setShowPaymentModal(false);
    setShowCreditCardModal(true);
  };

  // Handle credit card submission
  const handleCreditCardSubmit = async (paymentInfo: string) => {
    if (!selectedTripForPayment) return;
    
    setPaymentProcessing(true);
    setShowCreditCardModal(false);
    
    try {
      // Simulate payment processing with new card
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark trip as paid instead of removing it
      setPaidTrips(prev => new Set(prev).add(selectedTripForPayment.tripId.toString()));
      
      Alert.alert('Payment Successful', `Payment of $${selectedTripForPayment.cost?.toFixed(2)} has been processed successfully with your new card.`);
      setSelectedTripForPayment(null);
    } catch (error) {
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Handle credit card modal cancel
  const handleCreditCardCancel = () => {
    setShowCreditCardModal(false);
    setShowPaymentModal(true); // Go back to payment method selection
  };

  const loadBillingData = async () => {
    if (!token || !username) return;
    setLoading(true);
    setError(null);
    try {
      const users: User[] = await fetchAllUsers(token);
      const me = users.find(u => u.username === username);
      if (!me) {
        throw new Error("Current user not found");
      }
      const history = await fetchBillingHistory(me.id);
      setTrips(history);
    } catch (e: any) {
      setError(e?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadBillingData();
  }, [token, username, refreshKey]);

  // Refresh when tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadBillingData();
    }, [token, username])
  );

  // Auto-refresh every 30 seconds when component is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (token && username) {
        loadBillingData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [token, username]);

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#F15A29" />
        <Text style={styles.loadingText}>Loading billing data...</Text>
      </View>
    );
  }

  // Mock existing payment info for demo purposes
  const hasExistingCard = true; // In real app, check if user has saved payment method
  const mockPaymentInfo = "**** **** **** 1234"; // Mock payment info for display

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>
          <Ionicons name="receipt-outline" size={28} color="#F15A29" /> Billing History
        </Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#F15A29" />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={24} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trip History</Text>
        {trips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>No trips found</Text>
            {!loading && (
              <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Refresh</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          trips.map((trip, index) => {
            const isPaid = paidTrips.has(trip.tripId.toString());
            
            return (
              <TouchableOpacity
                key={trip.tripId}
                style={styles.tripCard}
                onPress={() => handleTripSelect(trip)}
                activeOpacity={0.7}
                delayPressIn={0}
              >
                <View style={styles.tripHeader}>
                  <Text style={styles.tripId}>Trip #{trip.tripId}</Text>
                  <Text style={styles.tripCost}>${(trip.cost ?? 0).toFixed(2)}</Text>
                </View>

                <View style={styles.tripDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="bicycle-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>Type: {trip.bikeType || 'Standard'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{trip.startStationName} → {trip.endStationName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>Duration: {trip.durationMinutes} min</Text>
                  </View>
                </View>

                <View style={styles.tripFooter}>
                  <View style={styles.paidBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.paidText}>Completed</Text>
                  </View>
                  <View style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color="#F15A29" />
                  </View>
                </View>

                {isPaid ? (
                  <View style={styles.paidMessage}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.paidMessageText}>Paid, thank you for using Bibixi!</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.payNowButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handlePayNow(trip);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="card" size={18} color="#fff" />
                    <Text style={styles.payNowText}>Pay Now</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <TripDetailsModal
        visible={!!selected}
        onClose={() => setSelected(null)}
        trip={selected}
        riderName={username}
      />

      {/* Payment Method Selection Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModalCard}>
            <Text style={styles.paymentModalTitle}>Choose Payment Method</Text>
            
            {selectedTripForPayment && (
              <View style={styles.paymentSummary}>
                <Text style={styles.paymentSummaryLabel}>Trip #{selectedTripForPayment.tripId}</Text>
                <Text style={styles.paymentSummaryAmount}>${selectedTripForPayment.cost?.toFixed(2)}</Text>
              </View>
            )}

            {hasExistingCard && (
              <TouchableOpacity
                style={styles.existingCardButton}
                onPress={handlePayWithExistingCard}
                disabled={paymentProcessing}
              >
                <View style={styles.cardMethodContent}>
                  <Ionicons name="card" size={24} color="#4CAF50" />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardMethodTitle}>Existing Card</Text>
                    <Text style={styles.cardMethodDetail}>{mockPaymentInfo}</Text>
                  </View>
                  {paymentProcessing ? (
                    <ActivityIndicator size="small" color="#4CAF50" />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
                  )}
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.newCardButton}
              onPress={handlePayWithNewCard}
              disabled={paymentProcessing}
            >
              <View style={styles.cardMethodContent}>
                <Ionicons name="add-circle" size={24} color="#2196F3" />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardMethodTitle}>Use New Card</Text>
                  <Text style={styles.cardMethodSubtext}>Enter new payment details</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#2196F3" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelPaymentButton}
              onPress={() => setShowPaymentModal(false)}
              disabled={paymentProcessing}
            >
              <Text style={styles.cancelPaymentText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Credit Card Modal */}
      <Modal
        visible={showCreditCardModal}
        transparent
        animationType="slide"
        onRequestClose={handleCreditCardCancel}
      >
        <View style={styles.creditCardModalOverlay}>
          <CreditCardScreen
            onSubmit={handleCreditCardSubmit}
            onCancel={handleCreditCardCancel}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

// Move computeCostBreakdown outside component to prevent re-creation
function computeCostBreakdown(t?: TripSummary) {
  if (!t) return { base: 0, perMinute: 0, eBikeSurcharge: 0 };
  const minutes = Math.max(0, t.durationMinutes || 0);

  // Standard plan
  const STD_BASE = 10.0;
  const STD_RATE = 0.25;
  // E-bike plan
  const E_BASE = 15.0;
  const E_RATE = 0.50;

  const base = (t.bikeType || '').toUpperCase().includes('E') ? E_BASE : STD_BASE;
  const rate = (t.bikeType || '').toUpperCase().includes('E') ? E_RATE : STD_RATE;
  const extraMinutes = Math.max(0, minutes - 30);
  const perMinute = extraMinutes * rate;

  // Surcharge = difference vs standard plan for same minutes
  const stdTotal = STD_BASE + Math.max(0, minutes - 30) * STD_RATE;
  const actualTotal = (t.cost ?? 0);
  const eBikeSurcharge = Math.max(0, actualTotal - stdTotal);

  return { base, perMinute, eBikeSurcharge };
}

// Memoize the TripDetailsModal to prevent unnecessary re-renders
const TripDetailsModal = React.memo(({ visible, onClose, trip, riderName }: { 
  visible: boolean; 
  onClose: () => void; 
  trip: TripSummary | null; 
  riderName: string 
}) => {
  if (!trip) return null;
  
  // Memoize the breakdown calculation for the selected trip
  const breakdown = React.useMemo(() => computeCostBreakdown(trip), [trip]);
  
  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide" 
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Trip Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="receipt" size={24} color="#fff" />
                <Text style={styles.summaryTitle}>Trip #{trip.tripId}</Text>
              </View>
              <Text style={styles.summaryAmount}>${Number(trip.cost ?? 0).toFixed(2)}</Text>
              <Text style={styles.summarySubtext}>Total Cost</Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <Ionicons name="bicycle" size={20} color="#F15A29" />
                <Text style={styles.infoLabel}>Bike Type</Text>
                <Text style={styles.infoValue}>{trip.bikeType}</Text>
              </View>
              
              <View style={styles.infoCard}>
                <Ionicons name="time" size={20} color="#F15A29" />
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{trip.durationMinutes}m</Text>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.modalSectionTitle}>
                <Ionicons name="information-circle" size={18} color="#F15A29" /> Trip Information
              </Text>
              
              <View style={styles.detailCard}>
                <View style={styles.modalDetailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="person" size={18} color="#F15A29" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.modalDetailLabel}>Rider</Text>
                    <Text style={styles.modalDetailValue}>{riderName || '-'}</Text>
                  </View>
                </View>
                
                <View style={styles.modalDetailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="location" size={18} color="#4CAF50" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.modalDetailLabel}>Start Station</Text>
                    <Text style={styles.modalDetailValue}>{trip.startStationName}</Text>
                  </View>
                </View>
                
                <View style={[styles.modalDetailRow, styles.lastDetailRow]}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="flag" size={18} color="#F44336" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.modalDetailLabel}>End Station</Text>
                    <Text style={styles.modalDetailValue}>{trip.endStationName}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.modalSectionTitle}>
                <Ionicons name="card" size={18} color="#F15A29" /> Cost Breakdown
              </Text>
              
              <View style={styles.detailCard}>
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Base Fee</Text>
                  <Text style={styles.costValue}>${breakdown.base.toFixed(2)}</Text>
                </View>
                
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>Per-minute Charge</Text>
                  <Text style={styles.costValue}>${breakdown.perMinute.toFixed(2)}</Text>
                </View>
                
                {breakdown.eBikeSurcharge > 0 && (
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>E-bike Surcharge</Text>
                    <Text style={styles.costValue}>${breakdown.eBikeSurcharge.toFixed(2)}</Text>
                  </View>
                )}
                
                <View style={styles.divider} />
                
                <View style={[styles.costRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>${Number(trip.cost ?? 0).toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.modalSectionTitle}>
                <Ionicons name="time-outline" size={18} color="#F15A29" /> Timeline
              </Text>
              
              <View style={styles.detailCard}>
                <View style={styles.timelineContainer}>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineIconContainer}>
                      <Ionicons name="play-circle" size={20} color="#4CAF50" />
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineLabel}>Trip Started</Text>
                      <Text style={styles.timelineTime}>{formatDate(trip.startTime)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.timelineLine} />
                  
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineIconContainer}>
                      <Ionicons name="stop-circle" size={20} color="#F44336" />
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineLabel}>Trip Ended</Text>
                      <Text style={styles.timelineTime}>{formatDate(trip.endTime)}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

function formatDate(millis: number) {
  if (!millis) return "-";
  const d = new Date(millis);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F6F1',
    padding: 20,
    borderRadius: 12,
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
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
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
  modalSectionTitle: {
    fontSize: 18,
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
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#F15A29',
    fontWeight: '600',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#F15A29',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#F15A29',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  lastDetailRow: {
    borderBottomWidth: 0,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  modalDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  modalDetailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  costLabel: {
    fontSize: 15,
    color: '#666',
  },
  costValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 8,
  },
  totalRow: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    color: '#F15A29',
    fontWeight: 'bold',
  },
  timelineContainer: {
    position: 'relative',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timelineIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: '#666',
  },
  timelineLine: {
    position: 'absolute',
    left: 17,
    top: 36,
    bottom: 16,
    width: 2,
    backgroundColor: '#e9ecef',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F15A29',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Pay Now Button
  payNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F15A29', // Changed to match app's primary color
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
    shadowColor: '#F15A29',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  payNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Paid Message Styles
  paidMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  paidMessageText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },

  // Payment Modal
  paymentModalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  paymentModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  paymentSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  paymentSummaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  paymentSummaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F15A29',
  },
  existingCardButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  newCardButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  cardMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cardMethodDetail: {
    fontSize: 14,
    color: '#666',
  },
  cardMethodSubtext: {
    fontSize: 12,
    color: '#999',
  },
  cancelPaymentButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelPaymentText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  creditCardModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});