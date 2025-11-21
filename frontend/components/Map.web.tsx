import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, FlatList, Button, Alert, Text } from 'react-native';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import Markers from './Markers.web';
import StationDetailsPanel from '@/components/StationDetailsPanel';
import TripSummaryModal from '@/components/TripSummaryModal';
import { fetchStations } from '@/api/auth/dashboardAPI';
import { StationData } from '@/types/station';
import { useBikeState } from '@/hooks/useBikeState';
import { useBikeOperations } from '@/hooks/useBikeOperations';
import { useOperatorOperations } from '@/hooks/useOperatorOperations';

export type MapWebProps = {
  userRole: 'rider' | 'operator';
};

export default function MapWeb({userRole}: MapWebProps) {
  const [stations, setStations] = useState<StationData[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [showTripSummary, setShowTripSummary] = useState(false);
  const [tripSummary, setTripSummary] = useState<any>(null);
  const [isReturningBike, setIsReturningBike] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [moveBikeSource, setMoveBikeSource] = useState<{station: StationData, bikeId: string} | null>(null);
  
  const operatorId = 2;
  const bikeState = useBikeState();

  const getStations = async () => {
    try {
      const stations = await fetchStations(operatorId);
      setStations(stations);
    } catch (err) {
      console.error("Failed to fetch stations", err);
    }
  };

  useEffect(() => {
    getStations();
  }, []);

  const bikeOps = useBikeOperations(bikeState, getStations);
  const operatorOps = useOperatorOperations(operatorId, getStations);

  const handleReturnBike = async (station: StationData, bikeId: string) => {
    setIsReturningBike(true);
    try {
      const summary = await bikeOps.handleReturnBike(station, bikeId);
      if (summary) {
        setTripSummary(summary);
        setShowTripSummary(true);
      }
      setSelectedStation(null);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to return bike');
    } finally {
      setIsReturningBike(false);
    }
  };

  const handleMoveBike = (station: StationData, dockIndex: number) => {
    const dock = station.docks?.[dockIndex];
    if (!dock?.bike) {
      Alert.alert('Error', 'No bike found in dock');
      return;
    }
    setMoveBikeSource({ station, bikeId: dock.bike.id });
    setShowDestinationModal(true);
  };

  const handleConfirmMoveBike = async (toStationId: string) => {
    if (!moveBikeSource) return;
    try {
      await operatorOps.handleMoveBike(
        moveBikeSource.station.id,
        toStationId,
        moveBikeSource.bikeId
      );
      Alert.alert('Success', 'Bike moved successfully!');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to move bike');
    } finally {
      setShowDestinationModal(false);
      setMoveBikeSource(null);
      setSelectedStation(null);
    }
  };

  const handleMaintenanceBike = async (station: StationData, dockIndex: number) => {
    const dock = station.docks?.[dockIndex];
    if (!dock) return;
    try {
      await operatorOps.handleToggleDockMaintenance(dock.id);
      Alert.alert('Success', `Dock ${dock.name} maintenance toggled`);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to toggle maintenance');
    }
  };

  return (
    <View style={styles.container}>
      <APIProvider apiKey={'AIzaSyCXEnqnsX-Sl1DevG3W1N8BBg7D2MdZwsU'}>
        <Map
          style={styles.map}
          defaultCenter={{ lat: 45.5017, lng: -73.5673 }}
          defaultZoom={13}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
          mapId={'ceb9e4d79f5cb872a4f0b0bd'}
        >
          <Markers stations={stations} onMarkerPress={setSelectedStation} />
        </Map>
      </APIProvider>

      <StationDetailsPanel
        visible={selectedStation !== null}
        station={selectedStation}
        userRole={userRole}
        hasReservedBike={bikeState.hasReservedBike}
        reservedBikeId={bikeState.reservedBikeId}
        hasCheckoutBike={bikeState.hasCheckoutBike}
        checkoutBikeId={bikeState.checkoutBikeId}
        loading={isReturningBike}
        onClose={() => setSelectedStation(null)}
        onReserveBike={bikeOps.handleReserveBike}
        onCheckoutBike={bikeOps.handleCheckoutBike}
        onReturnBike={handleReturnBike}
        onMoveBike={handleMoveBike}
        onMaintenanceBike={handleMaintenanceBike}
        onAddBikes={operatorOps.handleAddBikes}
      />

      <TripSummaryModal
        visible={showTripSummary}
        tripSummary={tripSummary}
        onClose={() => {
          setShowTripSummary(false);
          setTripSummary(null);
        }}
      />

      {/* Destination Station Modal */}
      <Modal visible={showDestinationModal} animationType="slide" transparent>
        <View style={{
          flex: 1, justifyContent: 'center', alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%'
          }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Select Destination Station</Text>
            <FlatList
              data={stations.filter(s => s.id !== moveBikeSource?.station.id)}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}
                  onPress={() => handleConfirmMoveBike(item.id)}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="Cancel" onPress={() => { setShowDestinationModal(false); setMoveBikeSource(null); }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
    modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingCard: {
  backgroundColor: 'white',
  padding: 28,
  borderRadius: 16,
  width: 250,
  alignItems: 'center',
  justifyContent: 'center',

  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  elevation: 10,
  },

  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },

  loadingSubtext: {
    fontSize: 16,
    color: '#666',
  },
});