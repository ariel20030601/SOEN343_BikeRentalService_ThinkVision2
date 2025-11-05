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

interface StationData {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  availableBikes: number;
  freeDocks: number;
  status: 'EMPTY' | 'OCCUPIED' | 'FULL' | 'OUT_OF_SERVICE';
  docks?: Dock[];
}

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
}: StationDetailsPanelProps) {
  const [selectedDock, setSelectedDock] = useState<number | null>(null);

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

  const bikesAvailable = standardCount + eBikeCount;
  const freeDocks = station.freeDocks ?? (station.capacity - bikesAvailable);
  const fullnessPercent = (bikesAvailable / station.capacity) * 100;
  const isOutOfService = station.status === 'OUT_OF_SERVICE';

  // --- Generate Dock Grid for visualization ---
  const docks = docksFromBackend.length
    ? docksFromBackend.map((dock, index) => ({
        id: dock.id,
        type: dock.bike ? (dock.bike.type === 'E_BIKE' ? 'ebike' : 'standard') : null,
        occupied: dock.status === 'OCCUPIED',
        outOfService: dock.status === 'OUT_OF_SERVICE',
      }))
    : Array.from({ length: station.capacity }, (_, i) => ({
        id: `dock-${i}`,
        type: null,
        occupied: i < bikesAvailable,
        outOfService: false,
      }));

  const getStatusColor = () => {
    if (isOutOfService) return '#9E9E9E'; // gray for OOS
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

  return (
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
              {docks.map((dock, index) => (
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
                    style={[styles.actionButton, styles.primaryButton, (!canMove || selectedDock === null) && styles.disabledButton]}
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
                </>
              )}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
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
});