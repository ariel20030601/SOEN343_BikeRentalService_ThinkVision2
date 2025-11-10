import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { StationData } from '@/hardcode/stationsData';

interface StationDetailsPanelProps {
  visible: boolean;
  station: StationData | null;
  userRole: 'rider' | 'operator';
  hasReservedBike?: boolean;
  onClose: () => void;
  onReserveBike?: (station: StationData) => void;
  onReturnBike?: (station: StationData) => void;
  onMoveBike?: (station: StationData) => void;
  onMaintenanceBike?: (station: StationData, dockIndex: number) => void;
  onAddBikes?: (station: StationData, standardCount: number, ebikeCount: number) => void;
}

export default function StationDetailsPanel({
  visible,
  station,
  userRole,
  hasReservedBike = false,
  onClose,
  onReserveBike,
  onReturnBike,
  onMoveBike,
  onMaintenanceBike,
  onAddBikes,
}: StationDetailsPanelProps) {
  const [selectedDock, setSelectedDock] = useState<number | null>(null);
  const [showAddBikesModal, setShowAddBikesModal] = useState(false);
  const [standardBikesInput, setStandardBikesInput] = useState('0');
  const [eBikesInput, setEBikesInput] = useState('0');

  if (!station) return null;

  const bikesAvailable = parseInt(station.bikes) + parseInt(station.ebikes);
  const freeDocks = parseInt(station.docks);
  const fullnessPercent = (bikesAvailable / station.capacity) * 100;
  const isOutOfService = station.status !== 'operational';

  // Generate dock grid data (mock for now - you'll need actual dock data)
  const generateDocks = () => {
    const docks = [];
    const totalBikes = parseInt(station.bikes);
    const totalEbikes = parseInt(station.ebikes);
    
    // Add standard bikes
    for (let i = 0; i < totalBikes; i++) {
      docks.push({ id: i, type: 'standard', occupied: true });
    }
    
    // Add e-bikes
    for (let i = totalBikes; i < totalBikes + totalEbikes; i++) {
      docks.push({ id: i, type: 'ebike', occupied: true });
    }
    
    // Add empty docks
    for (let i = totalBikes + totalEbikes; i < station.capacity; i++) {
      docks.push({ id: i, type: null, occupied: false });
    }
    
    return docks;
  };

  const docks = generateDocks();

  const getStatusColor = () => {
    if (fullnessPercent === 0 || fullnessPercent === 100) return '#F44336';
    if (fullnessPercent < 25 || fullnessPercent > 85) return '#FFC107';
    return '#4CAF50';
  };

  const canReserve = !hasReservedBike && bikesAvailable > 0 && !isOutOfService;
  const canReturn = hasReservedBike && freeDocks > 0 && !isOutOfService;
  const canMove = bikesAvailable > 0 && !isOutOfService;

  const handleDockPress = (dockIndex: number) => {
    if (userRole === 'operator' && docks[dockIndex].occupied) {
      setSelectedDock(dockIndex);
    }
  };

  const handleAddBikes = () => {
    const standardCount = parseInt(standardBikesInput) || 0;
    const ebikeCount = parseInt(eBikesInput) || 0;
    const totalToAdd = standardCount + ebikeCount;

    if (totalToAdd <= 0) {
      Alert.alert('Invalid Input', 'Please add at least 1 bike.');
      return;
    }

    if (totalToAdd > freeDocks) {
      Alert.alert(
        'Not Enough Space',
        `You can only add ${freeDocks} bike${freeDocks !== 1 ? 's' : ''} (free docks available).`
      );
      return;
    }

    onAddBikes?.(station, standardCount, ebikeCount);
    setShowAddBikesModal(false);
    setStandardBikesInput('0');
    setEBikesInput('0');
  };

  const resetAddBikesModal = () => {
    setShowAddBikesModal(false);
    setStandardBikesInput('0');
    setEBikesInput('0');
  };

  const totalBikesToAdd = (parseInt(standardBikesInput) || 0) + (parseInt(eBikesInput) || 0);

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.title}>{station.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                  <Text style={styles.statusText}>{station.status}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Station Info */}
            <View style={styles.infoCard}>
              <Text style={styles.address}>{station.address}</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{bikesAvailable}</Text>
                  <Text style={styles.statLabel}>Bikes Available</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{freeDocks}</Text>
                  <Text style={styles.statLabel}>Free Docks</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{station.capacity}</Text>
                  <Text style={styles.statLabel}>Total Capacity</Text>
                </View>
              </View>
            </View>

            {/* Dock Grid */}
            <ScrollView style={styles.scrollContent}>
              <Text style={styles.sectionTitle}>Docks</Text>
              <View style={styles.dockGrid}>
                {docks.map((dock, index) => (
                  <TouchableOpacity
                    key={dock.id}
                    style={[
                      styles.dockCell,
                      dock.occupied ? styles.dockOccupied : styles.dockEmpty,
                      selectedDock === index && styles.dockSelected,
                    ]}
                    onPress={() => handleDockPress(index)}
                    disabled={!dock.occupied || userRole === 'rider'}
                  >
                    <Text style={styles.dockNumber}>{index + 1}</Text>
                    {dock.type === 'ebike' && (
                      <View style={styles.eBikeBadge}>
                        <Text style={styles.eBikeText}>E</Text>
                      </View>
                    )}
                    {dock.type === 'standard' && dock.occupied && (
                      <Text style={styles.bikeIcon}>🚲</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Out of Service Warning */}
              {isOutOfService && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    ⚠️ This station is currently out of service
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actionsContainer}>
                {userRole === 'rider' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.primaryButton, !canReserve && styles.disabledButton]}
                      onPress={() => onReserveBike?.(station)}
                      disabled={!canReserve}
                    >
                      <Text style={styles.buttonText}>
                        {hasReservedBike ? 'Already Have Bike' : 'Reserve Bike'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.secondaryButton, !canReturn && styles.disabledButton]}
                      onPress={() => onReturnBike?.(station)}
                      disabled={!canReturn}
                    >
                      <Text style={styles.buttonText}>Return Bike</Text>
                    </TouchableOpacity>

                    {!canReturn && hasReservedBike && freeDocks === 0 && (
                      <Text style={styles.errorText}>
                        No free docks available. Please return to another station.
                      </Text>
                    )}
                  </>
                )}

                {userRole === 'operator' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.primaryButton, !canMove && styles.disabledButton]}
                      onPress={() => onMoveBike?.(station)}
                      disabled={!canMove || selectedDock === null}
                    >
                      <Text style={styles.buttonText}>
                        {selectedDock !== null ? `Move Bike from Dock ${selectedDock + 1}` : 'Select Bike to Move'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.warningButton, selectedDock === null && styles.disabledButton]}
                      onPress={() => selectedDock !== null && onMaintenanceBike?.(station, selectedDock)}
                      disabled={selectedDock === null}
                    >
                      <Text style={styles.buttonText}>
                        {selectedDock !== null ? `Send Dock ${selectedDock + 1} to Maintenance` : 'Select Bike First'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.addBikesButton, freeDocks === 0 && styles.disabledButton]}
                      onPress={() => setShowAddBikesModal(true)}
                      disabled={freeDocks === 0}
                    >
                      <Text style={styles.buttonText}>➕ Add Bikes</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Bikes Modal */}
      <Modal
        visible={showAddBikesModal}
        animationType="fade"
        transparent={true}
        onRequestClose={resetAddBikesModal}
      >
        <Pressable style={styles.modalOverlay} onPress={resetAddBikesModal}>
          <Pressable style={styles.addBikesModal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Add Bikes to {station?.title}</Text>
            
            <View style={styles.modalInfo}>
              <Text style={styles.modalInfoText}>
                Free Docks Available: <Text style={styles.modalInfoHighlight}>{freeDocks}</Text>
              </Text>
            </View>

            {/* Standard Bikes Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Standard Bikes</Text>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={() => setStandardBikesInput(String(Math.max(0, (parseInt(standardBikesInput) || 0) - 1)))}
                >
                  <Text style={styles.incrementText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={standardBikesInput}
                  onChangeText={(text) => setStandardBikesInput(text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={() => setStandardBikesInput(String((parseInt(standardBikesInput) || 0) + 1))}
                >
                  <Text style={styles.incrementText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* E-Bikes Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-Bikes</Text>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={() => setEBikesInput(String(Math.max(0, (parseInt(eBikesInput) || 0) - 1)))}
                >
                  <Text style={styles.incrementText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={eBikesInput}
                  onChangeText={(text) => setEBikesInput(text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={() => setEBikesInput(String((parseInt(eBikesInput) || 0) + 1))}
                >
                  <Text style={styles.incrementText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Total Summary */}
            <View style={styles.totalSummary}>
              <Text style={styles.totalText}>
                Total Bikes to Add: <Text style={styles.totalHighlight}>{totalBikesToAdd}</Text>
              </Text>
              {totalBikesToAdd > freeDocks && (
                <Text style={styles.errorTextModal}>
                  ⚠️ Exceeds available free docks ({freeDocks})
                </Text>
              )}
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={resetAddBikesModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddBikes}
              >
                <Text style={styles.confirmButtonText}>Add Bikes</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: '#666',
  },
  infoCard: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ddd',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  dockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dockCell: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  dockEmpty: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  dockOccupied: {
    backgroundColor: '#424242',
    borderColor: '#212121',
  },
  dockSelected: {
    borderColor: '#2196F3',
    borderWidth: 3,
  },
  dockNumber: {
    fontSize: 10,
    color: '#999',
    position: 'absolute',
    top: 2,
    left: 4,
  },
  eBikeBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#2196F3',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  eBikeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bikeIcon: {
    fontSize: 24,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 30,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#F44336',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  addBikesButton: {
    backgroundColor: '#9C27B0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBikesModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalInfoText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
  },
  modalInfoHighlight: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  incrementButton: {
    backgroundColor: '#f5f5f5',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  incrementText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 80,
    color: '#333',
  },
  totalSummary: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  totalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  totalHighlight: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#4CAF50',
  },
  errorTextModal: {
    color: '#F44336',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});