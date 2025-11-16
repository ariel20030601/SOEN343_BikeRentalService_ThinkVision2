import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Button, Alert, ScrollView } from 'react-native';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import Markers from './Markers.web';
import StationDetailsPanel from '@/components/StationDetailsPanel';
import { reserveBike, checkoutBike, returnBike } from '@/api/auth/bmsAPI';
import { TripSummaryDTO } from '@/api/auth/histAPI';
import { fetchStations } from '@/api/auth/dashboardAPI';
import { getTripSummary } from '@/api/auth/prcAPI';


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

export default function MapWeb() {
  const [stations, setStations] = useState<StationData[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [userRole] = useState<'rider' | 'operator'>('rider'); // TODO: Get from context
  const [hasReservedBike, setHasReservedBike] = useState(false);
  const [hasCheckoutBike, setHasCheckoutBike] = useState(false);
  const [checkoutBikeId, setCheckoutBikeId] = useState<string | null>(null);
  const [reservedBikeId, setReservedBikeId] = useState<string | null>(null);
  const [currentTripId, setCurrentTripId] = useState<number | null>(null);
  const [showTripSummary, setShowTripSummary] = useState(false);
  const [tripSummary, setTripSummary] = useState<TripSummaryDTO | null>(null);
  const { user } = useAuth();    
  const operatorId = 2;
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [moveBikeSource, setMoveBikeSource] = useState<{station: StationData, bikeId: string} | null>(null);


  const getStations = async () => {
    try {
        console.log("operatorId:", operatorId);
        const stations = await fetchStations(operatorId);
        setStations(stations);
      } catch (err) {
        console.error("Failed to fetch stations", err);
      }
  }
  useEffect(() => {
    getStations();
  }, []);


  const handleReserveBike = async (station: StationData, bikeId: string) => {
    // derive riderId from auth user (safe fallbacks)
    const riderId = (user as any)?.id ?? (user as any)?.userId ?? (user as any)?.sub ?? 1;

    try {
      console.log('Reserving bike:', { riderId, stationId: station.id, bikeId });
      const reservation = await reserveBike(riderId, station.id, bikeId);
      console.log('Reserve response:', reservation);
      setHasReservedBike(true);
      setReservedBikeId(bikeId);
      console.log('Success', 'Bike reserved successfully');
    } catch (err) {
      console.error('Reserve error:', err);
      console.log('Error', 'Failed to reserve bike');
    }
  };

  const handleCheckoutBike = async (station: StationData, bikeId?: string) => {
    const riderId = (user as any)?.id ?? (user as any)?.userId ?? (user as any)?.sub ?? 1;

    let finalBikeId: string;
    if (hasReservedBike && reservedBikeId) {
      const reservedBikeDock = station.docks?.find(d => d.bike?.id === reservedBikeId);
      if (!reservedBikeDock) {
        console.log('Error', 'Your reserved bike is not at this station');
        return;
      }
      finalBikeId = reservedBikeId;
    } else {
      if (!bikeId) {
        console.log('Error', 'Please select a bike to checkout');
        return;
      }
      const selectedDock = station.docks?.find(d => d.bike?.id === bikeId);
      if (!selectedDock?.bike) {
        console.log('Error', 'Selected bike not found');
        return;
      }
      if (selectedDock.bike.status === 'RESERVED') {
        console.log('Error', 'This bike is reserved by another rider');
        return;
      }
      finalBikeId = bikeId;
    }

    try {
      console.log('Checkout bike:', { riderId, stationId: station.id, bikeId: finalBikeId });
      const trip = await checkoutBike(riderId, station.id, finalBikeId);
      console.log('Checkout response:', trip);
      
      // Clear reservation state and set checkout state
      setHasReservedBike(false);
      setReservedBikeId(null);
      setHasCheckoutBike(true);
      setCheckoutBikeId(finalBikeId);
      setCurrentTripId(trip.id);
      setSelectedStation(null);
      
      // Refresh stations so docks update
      getStations().catch(() => {});
      console.log('Success', 'Bike checked out successfully');
    } catch (err) {
      console.error('Checkout error:', err);
      console.log('Error', err instanceof Error ? err.message : 'Failed to checkout bike');
    }
  };


  const handleReturnBike = async (station: StationData, bikeId: string) => {
    const riderId = (user as any)?.id ?? (user as any)?.userId ?? (user as any)?.sub ?? 1;

    try {
      console.log('Returning bike:', { riderId, stationId: station.id, bikeId });
      const trip = await returnBike(riderId, station.id, bikeId);
      console.log('Return response:', trip);

      setHasCheckoutBike(false);
      setCheckoutBikeId(null);

      if (currentTripId) {
        try {
          const summary = await getTripSummary(currentTripId);
          console.log('Trip summary from backend:', JSON.stringify(summary, null, 2));
          setTripSummary(summary);
          setShowTripSummary(true);
          setCurrentTripId(null);
        } catch (err) {
          console.error('Failed to fetch trip summary:', err);
          console.log('Success', 'Bike returned successfully');
        }
      } else {
        console.log('Success', 'Bike returned successfully');
      }
      setSelectedStation(null);
      getStations().catch(() => {});
    } catch (err) {
      console.error('Return error:', err);
      console.log('Error', err instanceof Error ? err.message : 'Failed to return bike');
    }
  };

  const handleMoveBike = (station: StationData, dockIndex: number) => {
    const dock = station.docks?.[dockIndex];
    if (!dock?.bike) {
      Alert.alert('Error', 'No bike found in Dock 13');
      return;
    }
    setMoveBikeSource({ station, bikeId: dock.bike.id });
    setShowDestinationModal(true);
  };

  // Called after user selects destination station
  const handleConfirmMoveBike = async (toStationId: string) => {
    if (!moveBikeSource || !operatorId) return;
    console.log('Moving bike:', {
      operatorId,
      fromStationId: moveBikeSource.station.id,
      toStationId,
      bikeId: moveBikeSource.bikeId
    });
    try {
      const response = await fetch(
        `http://localhost:8080/api/operator/move-bike?operatorId=${operatorId}&fromStationId=${moveBikeSource.station.id}&toStationId=${toStationId}&bikeId=${moveBikeSource.bikeId}`,
        { method: 'POST' }
      );
      console.log('Move bike response:', response);
      if (response.ok) {
        console.error('Success', 'Bike moved successfully!');
        await getStations();
      } else {
        const errorText = await response.text();
        console.error('Error', errorText);
      }
    } catch (err) {
      console.error(err);
      console.error('Error', 'Failed to move bike');
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
      const response = await fetch(
        `http://localhost:8080/api/operator/toggle-dock?operatorId=${operatorId}&dockId=${dock.id}`,
        { method: 'POST' }
      );
      if (response.ok) {
        Alert.alert('🔧 Success', `Dock ${dock.name} maintenance toggled`);
      } else {
        const errorText = await response.text();
        Alert.alert('Error', errorText);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to toggle dock maintenance');
    }
  };

  const handleAddBikes = async (
    station: StationData,
    counts: { standard: number; eBike: number }
  ) => {
    const total = (counts?.standard ?? 0) + (counts?.eBike ?? 0);
    if (!total) return;

    const baseUrl = 'http://localhost:8080/api/operator/add-bike';
    const addOne = async (type: 'STANDARD' | 'E_BIKE', idx: number) => {
      const bikeId = `${station.id}-${type === 'E_BIKE' ? 'EB' : 'SB'}-${Date.now()}-${idx}`;
      const url =
        `${baseUrl}?operatorId=${operatorId}` +
        `&stationId=${encodeURIComponent(station.id)}` +
        `&bikeId=${encodeURIComponent(bikeId)}` +
        `&type=${type}`;
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    };

    try {
      console.log('Adding bikes (sequential):', { stationId: station.id, counts });
      let added = 0;

      for (let i = 0; i < (counts.standard ?? 0); i++) {
        try {
          await addOne('STANDARD', i);
          added++;
        } catch (e) {
          console.error('Add STANDARD failed at', i, e);
          break;
        }
      }

      for (let i = 0; i < (counts.eBike ?? 0); i++) {
        try {
          await addOne('E_BIKE', i);
          added++;
        } catch (e) {
          console.error('Add E_BIKE failed at', i, e);
          break;
        }
      }

      await getStations();
      console.log(`Success: added ${added} bikes`);
    } catch (e) {
      console.error('Add bikes failed:', e);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '0 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <View style={styles.container}>
      <APIProvider apiKey={'AIzaSyCXEnqnsX-Sl1DevG3W1N8BBg7D2MdZwsU'}>
        <Map
          style={styles.map}
          defaultCenter={{
            lat: 45.5017, // Montreal
            lng: -73.5673
          }}
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
          hasReservedBike={hasReservedBike}
          reservedBikeId={reservedBikeId} // Add this
          hasCheckoutBike={hasCheckoutBike}
          checkoutBikeId={checkoutBikeId}
          onClose={() => setSelectedStation(null)}
          onReserveBike={handleReserveBike}
          onCheckoutBike={handleCheckoutBike}
          onReturnBike={handleReturnBike}
          onMoveBike={handleMoveBike}
          onMaintenanceBike={handleMaintenanceBike}
          onAddBikes={handleAddBikes}
      />

      {/* Trip Summary Modal */}
      <Modal visible={showTripSummary} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>🚴 Trip Summary</Text>
            
            <ScrollView style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Trip ID:</Text>
                <Text style={styles.summaryValue}>#{tripSummary?.tripId}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Bike ID:</Text>
                <Text style={styles.summaryValue}>{tripSummary?.bikeId}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration:</Text>
                <Text style={styles.summaryValue}>
                  {formatDuration(tripSummary?.durationMinutes)}
                </Text>
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.summaryButton}
              onPress={() => {
                setShowTripSummary(false);
                setTripSummary(null);
              }}
            >
              <Text style={styles.summaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
});