import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';

// Backend structure
interface Dock {
  id: string;
  name: string;
  status: 'OCCUPIED' | 'EMPTY' | 'OUT_OF_SERVICE';
  bike?: {
    id: string;
    type: 'STANDARD' | 'E_BIKE';
    status: 'AVAILABLE' | 'RESERVED' | 'ON_TRIP' | 'MAINTENANCE';
  };
}

export type StationStatus = "EMPTY" | "OCCUPIED" | "FULL" | "OUT_OF_SERVICE";

export interface StationData {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  availableBikes: number;
  freeDocks: number;
  status: StationStatus;
  docks?: {
    id: string;
    name: string;
    status: string;
    bike?: {
      id: string;
      type: "STANDARD" | "E_BIKE";
      status: string;
    };
  }[];
}
interface StationDetailsPanelProps {
  visible: boolean;
  station: StationData | null;
  userRole: 'rider' | 'operator';
  hasReservedBike?: boolean;
  reservedBikeId?: string | null; // Track which bike is reserved
  hasCheckoutBike?: boolean;
  checkoutBikeId?: string | null;
  loading?: boolean;
  onClose: () => void;
  onReserveBike?: (station: StationData, bikeId: string) => void;
  onCheckoutBike?: (station: StationData, bikeId?: string) => void;
  onReturnBike?: (station: StationData, bikeId: string) => void;
  onMoveBike?: (station: StationData, dockIndex: number) => void;
  onMaintenanceBike?: (station: StationData, dockIndex: number) => void;
  onAddBikes?: (station: StationData, counts: { standard: number; eBike: number }) => void | Promise<void>;
}

export default function StationDetailsPanel({
  visible,
  station,
  userRole,
  hasReservedBike = false,
  reservedBikeId = null,
  hasCheckoutBike = false,
  checkoutBikeId = null,
  loading,
  onClose,
  onReserveBike,
  onCheckoutBike,
  onReturnBike,
  onMoveBike,
  onMaintenanceBike,
  onAddBikes,
}: StationDetailsPanelProps) {
  const [selectedDock, setSelectedDock] = useState<number | null>(null);

  // --- Local UI-only state for adding bikes (virtual) ---
  // Map of dockIndex -> { type: 'STANDARD' | 'E_BIKE' } representing UI-added bikes
  const [localAdded, setLocalAdded] = useState<Record<number, { type: 'STANDARD' | 'E_BIKE' }>>({});
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addStandard, setAddStandard] = useState(0);
  const [addEbike, setAddEbike] = useState(0);

  if (!station) return null;

  // --- Compute bikes and e-bikes dynamically from backend data ---
  let standardCount = 0;
  let eBikeCount = 0;
  const docksFromBackend = station.docks || [];

  docksFromBackend.forEach((dock) => {
    if (dock.bike) {
      if (dock.bike.type === 'E_BIKE') eBikeCount++;
      else standardCount++;
    }
  });

  // Counts including local-added virtual bikes
  const addedStandardCount = Object.values(localAdded).filter((x) => x.type === 'STANDARD').length;
  const addedEbikeCount = Object.values(localAdded).filter((x) => x.type === 'E_BIKE').length;
  const overlayCount = addedStandardCount + addedEbikeCount;

  const baseBikesAvailable = standardCount + eBikeCount;
  const bikesAvailable = baseBikesAvailable + overlayCount;

  // Always compute free docks from capacity to reflect local UI additions
  const freeDocks = Math.max(0, station.capacity - bikesAvailable);
  const fullnessPercent = (bikesAvailable / station.capacity) * 100;
  const isOutOfService = station.status === 'OUT_OF_SERVICE';

  // --- Generate Dock Grid for visualization (merge backend + virtual added) ---
  const docks = docksFromBackend.length
    ? docksFromBackend.map((dock, index) => {
        const originalOccupied = dock.status === 'OCCUPIED' || !!dock.bike;
        const overlay = localAdded[index];
        const occupied = originalOccupied || !!overlay;
        const outOfService = dock.status === 'OUT_OF_SERVICE';
        const type = overlay
          ? overlay.type === 'E_BIKE'
            ? 'ebike'
            : 'standard'
          : dock.bike
          ? dock.bike.type === 'E_BIKE'
            ? 'ebike'
            : 'standard'
          : null;
        return {
          id: dock.id,
          type,
          occupied,
          outOfService,
          virtualAdded: !!overlay && !originalOccupied,
        };
      })
    : Array.from({ length: station.capacity }, (_, i) => {
        const overlay = localAdded[i];
        const originalOccupied = i < baseBikesAvailable; // backend approximation when no docks provided
        const occupied = originalOccupied || !!overlay;
        const type =
          overlay ? (overlay.type === 'E_BIKE' ? 'ebike' : 'standard') : originalOccupied ? 'standard' : null;
        return {
          id: `dock-${i}`,
          type,
          occupied,
          outOfService: false,
          virtualAdded: !!overlay && !originalOccupied,
        };
      });

  const getStatusColor = () => {
    if (isOutOfService) return '#9E9E9E';
    if (fullnessPercent === 0 || fullnessPercent === 100) return '#F44336';
    if (fullnessPercent < 25 || fullnessPercent > 85) return '#FFC107';
    return '#4CAF50';
  };

  const canReserve = !hasReservedBike && bikesAvailable > 0 && !isOutOfService;
  const canCheckout = !hasCheckoutBike && bikesAvailable > 0 && !isOutOfService;
  const canReturn = hasCheckoutBike && freeDocks > 0 && !isOutOfService;
  const canMove = bikesAvailable > 0 && !isOutOfService;

  const handleDockPress = (dockIndex: number) => {
    // prevent selecting virtual-added bikes for actions
    if (docks[dockIndex].occupied && !docks[dockIndex].virtualAdded) {
      setSelectedDock(dockIndex);
    }
  };

  // Compute empty indices (considering backend occupancy + current virtual additions)
  const getEmptyIndices = (): number[] => {
    const total = docksFromBackend.length ? docksFromBackend.length : station.capacity;
    const occupied = new Set<number>();
    if (docksFromBackend.length) {
      docksFromBackend.forEach((d, i) => {
        if (d.status === 'OCCUPIED' || !!d.bike) occupied.add(i);
      });
    } else {
      for (let i = 0; i < baseBikesAvailable; i++) occupied.add(i);
    }
    Object.keys(localAdded).forEach((k) => occupied.add(Number(k)));
    const empty: number[] = [];
    for (let i = 0; i < total; i++) {
      if (!occupied.has(i)) empty.push(i);
    }
    return empty;
  };

  const resetAddModal = () => {
    setAddStandard(0);
    setAddEbike(0);
  };

  const openAddModal = () => {
    resetAddModal();
    setAddModalVisible(true);
  };

  const confirmAddBikes = async () => {
     const toAddTotal = addStandard + addEbike;
     if (toAddTotal <= 0) return;
     if (toAddTotal > freeDocks) return;
     try{
      await onAddBikes?.(station, { standard: addStandard, eBike: addEbike});
     } finally {
      setAddModalVisible(false);
      resetAddModal();
     }
  };

  const canAddBikes = freeDocks > 0; // available even if OUT_OF_SERVICE per requirements
  const addTotal = addStandard + addEbike;
  const addInvalid = addTotal <= 0 || addTotal > freeDocks;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {}}
    >
      <Pressable style={styles.overlay}>
        <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>{station.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.statusText}>{station.status.toLowerCase()}</Text>
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
              {docks.map((dock, index) => {
                const isReservedByUser = hasReservedBike && 
                  docksFromBackend[index]?.bike?.id === reservedBikeId;
                return (
                  <TouchableOpacity
                    key={dock.id}
                    style={[
                      styles.dockCell,
                      dock.outOfService
                        ? { backgroundColor: '#B0BEC5', borderColor: '#78909C' }
                        : dock.occupied
                        ? styles.dockOccupied
                        : styles.dockEmpty,
                      selectedDock === index && styles.dockSelected,
                      isReservedByUser && styles.dockReservedByUser,
                    
                    ]}
                    onPress={() => handleDockPress(index)}
                    disabled={!dock.occupied || dock.virtualAdded}
                  >
                    <Text style={styles.dockNumber}>{index + 1}</Text>
                    {isReservedByUser && (
                      <Text style={styles.reservedIndicator}>★</Text>
                    )}
                    {dock.type === 'ebike' && (
                      <View style={styles.eBikeBadge}>
                        <Text style={styles.eBikeText}>E</Text>
                      </View>
                    )}
                    {dock.type === 'standard' && dock.occupied && (
                      <Text style={styles.bikeIcon}>🚲</Text>
                    )}
                  </TouchableOpacity>
                );
            })}
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
                    style={[styles.actionButton, styles.primaryButton, (!canReserve || selectedDock === null) && styles.disabledButton]}
                    onPress={() => {
                      if (selectedDock !== null && docks[selectedDock].occupied) {
                        const dock = docksFromBackend[selectedDock];
                        if (dock?.bike?.id) {
                          onReserveBike?.(station, dock.bike.id);
                          setSelectedDock(null); // Clear selection after reserve
                        }
                      }
                    }}
                    disabled={!canReserve || selectedDock === null}
                  >
                    <Text style={styles.buttonText}>
                      {hasCheckoutBike ? 'Bike Already Checked Out' : hasReservedBike ? 'Already Have Reservation' : selectedDock !== null 
                        ? `Reserve Bike from Dock ${selectedDock + 1}` 
                        : 'Select Bike to Reserve'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionButton, 
                      styles.warningButton, 
                      (!canCheckout || (!hasReservedBike && selectedDock === null)) && styles.disabledButton
                    ]}
                    onPress={() => {
                      if (canCheckout) {
                        if (hasReservedBike) {
                          // Has reservation - checkout reserved bike (no selection needed)
                          onCheckoutBike?.(station);
                        } else if (selectedDock !== null && docks[selectedDock].occupied) {
                          // No reservation - checkout selected bike
                          const dock = docksFromBackend[selectedDock];
                          if (dock?.bike?.id) {
                            onCheckoutBike?.(station, dock.bike.id);
                            setSelectedDock(null);
                          }
                        }
                      }
                    }}
                    disabled={!canCheckout || (!hasReservedBike && selectedDock === null)}
                  >
                    <Text style={styles.buttonText}>
                      {hasCheckoutBike 
                        ? 'Already Have Bike' 
                        : hasReservedBike 
                        ? 'Checkout Reserved Bike'
                        : selectedDock !== null
                        ? `Checkout Bike from Dock ${selectedDock + 1}`
                        : 'Select Bike to Checkout'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton, !canReturn && styles.disabledButton]}
                    onPress={() => {
                      if (checkoutBikeId) {
                        onReturnBike?.(station, checkoutBikeId);
                        setSelectedDock(null); 
                      }
                    }}
                    disabled={!canReturn}
                  >
                    <Text style={styles.buttonText}>Return Bike</Text>
                  </TouchableOpacity>

                  {!canReturn && hasCheckoutBike && freeDocks === 0 && (
                    <Text style={styles.errorText}>
                      No free docks available. Please return to another station.
                    </Text>
                  )}
                </>
              )}

              {userRole === 'operator' && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.secondaryButton,
                      !canAddBikes && styles.disabledButton,
                    ]}
                    onPress={openAddModal}
                    disabled={!canAddBikes}
                    >
                    <Text style={styles.buttonText}>
                      {canAddBikes ? 'Add Bikes' : 'Station Full'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton, (!canMove || selectedDock === null) && styles.disabledButton]}
                    onPress={() => selectedDock !== null && onMoveBike?.(station, selectedDock)}
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
                </>
              )}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>

      {/* Add Bikes Modal */}
      <Modal visible={addModalVisible} transparent animationType="fade" onRequestClose={() => setAddModalVisible(false)}>
        <Pressable style={styles.addModalOverlay} onPress={() => setAddModalVisible(false)}>
          <Pressable style={styles.addModalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.addModalTitle}>Add Bikes</Text>
            <Text style={styles.addModalSubtitle}>
              Free docks available: {freeDocks}
            </Text>

            <View style={styles.stepRow}>
              <Text style={styles.stepLabel}>Standard</Text>
              <View style={styles.stepControls}>
                <TouchableOpacity
                  style={[styles.stepBtn, addStandard <= 0 && styles.stepBtnDisabled]}
                  onPress={() => setAddStandard(Math.max(0, addStandard - 1))}
                  disabled={addStandard <= 0}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <View style={styles.stepValueBox}><Text style={styles.stepValue}>{addStandard}</Text></View>
                <TouchableOpacity
                  style={[styles.stepBtn, addStandard + addEbike >= freeDocks && styles.stepBtnDisabled]}
                  onPress={() => setAddStandard(Math.min(freeDocks - addEbike, addStandard + 1))}
                  disabled={addStandard + addEbike >= freeDocks}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.stepRow}>
              <Text style={styles.stepLabel}>E-Bike</Text>
              <View style={styles.stepControls}>
                <TouchableOpacity
                  style={[styles.stepBtn, addEbike <= 0 && styles.stepBtnDisabled]}
                  onPress={() => setAddEbike(Math.max(0, addEbike - 1))}
                  disabled={addEbike <= 0}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <View style={styles.stepValueBox}><Text style={styles.stepValue}>{addEbike}</Text></View>
                <TouchableOpacity
                  style={[styles.stepBtn, addStandard + addEbike >= freeDocks && styles.stepBtnDisabled]}
                  onPress={() => setAddEbike(Math.min(freeDocks - addStandard, addEbike + 1))}
                  disabled={addStandard + addEbike >= freeDocks}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.addSummary}>
              Total to add: {addTotal} {addInvalid && '(invalid selection)'}
            </Text>

            <View style={styles.addActions}>
              <TouchableOpacity style={[styles.addCancelBtn]} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.addCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addConfirmBtn, addInvalid && styles.addConfirmDisabled]}
                onPress={confirmAddBikes}
                disabled={addInvalid}
              >
                <Text style={styles.addConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Modal>
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
  loadingOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255,255,255,0.7)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  dockReservedByUser: {
  borderColor: '#FFD700',
  borderWidth: 3,
  backgroundColor: '#424242',
  },
  reservedIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    color: '#FFD700',
    fontSize: 16,
  },

  // Add Bikes modal styles
  addModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  addModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  addModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  addModalSubtitle: {
    marginTop: 4,
    color: '#666',
  },
  stepRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepLabel: {
    fontSize: 16,
    color: '#333',
  },
  stepControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    backgroundColor: '#EEE',
  },
  stepBtnText: {
    fontSize: 20,
    color: '#1976D2',
    fontWeight: '700',
    marginTop: -2,
  },
  stepValueBox: {
    minWidth: 48,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  stepValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addSummary: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
  },
  addActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  addCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addCancelText: {
    color: '#666',
    fontWeight: '600',
  },
  addConfirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  addConfirmDisabled: {
    backgroundColor: '#BDBDBD',
  },
  addConfirmText: {
    color: 'white',
    fontWeight: '700',
  },
});