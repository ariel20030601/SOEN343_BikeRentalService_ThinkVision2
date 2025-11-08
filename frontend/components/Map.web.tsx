import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Button, Alert } from 'react-native';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import Markers from './Markers.web';
import StationDetailsPanel from '@/components/StationDetailsPanel';

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
  const { user } = useAuth();    
  const operatorId = 2;
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [moveBikeSource, setMoveBikeSource] = useState<{station: StationData, bikeId: string} | null>(null);

  useEffect(() => {
    async function fetchStations() {
      try {
        console.log("operatorId:", operatorId);
        const response = await fetch('http://localhost:8080/api/stations');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        console.log("Fetched stations:", data);
        setStations(data);
      } catch (err) {
        console.error("Failed to fetch stations", err);
      }
    }
    fetchStations();
  }, []);


// ...existing code...
  const handleReserveBike = async (station: StationData) => {
    // pick a bike from the station (first dock that has a bike)
    const bikeDock = station.docks?.find(d => d.bike);
    if (!bikeDock?.bike) {
      Alert.alert('Error', 'No available bike to reserve at this station');
      return;
    }

    // derive riderId from auth user (safe fallbacks)
    const riderId = (user as any)?.id ?? (user as any)?.userId ?? (user as any)?.sub ?? 1;
    const bikeId = bikeDock.bike.id;

    const body = {
      riderId,
      stationId: station.id,
      bikeId
    };

    try {
      console.log('Reserving bike with body:', body);
      const response = await fetch('http://localhost:8080/api/bikes/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Reserve response:', data);
        setHasReservedBike(true);
        setReservedBikeId(bikeId);
        setSelectedStation(null);
        Alert.alert('Success', 'Bike reserved successfully');
      } else {
        const errText = await response.text();
        console.error('Reserve failed:', errText);
        Alert.alert('Error', errText || 'Failed to reserve bike');
      }
    } catch (err) {
      console.error('Reserve error:', err);
      Alert.alert('Error', 'Failed to reserve bike');
    }
  };

  const handleCheckoutBike = async (station: StationData) => {
    const bikeDock = station.docks?.find(d => d.bike);
    if (!bikeDock?.bike) {
      Alert.alert('Error', 'No available bike to checkout at this station');
      return;
    }

    const riderId = (user as any)?.id ?? (user as any)?.userId ?? (user as any)?.sub ?? 1;
    const bikeId = bikeDock.bike.id;

    const body = {
      riderId,
      stationId: station.id,
      bikeId
    };

    try {
      console.log('Checkout bike with body:', body);
      const response = await fetch('http://localhost:8080/api/bikes/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Checkout response:', data);
        setHasReservedBike(false);
        setReservedBikeId(null);
        setHasCheckoutBike(true);
        setCheckoutBikeId(bikeId);
        setSelectedStation(null);
        Alert.alert('Success', 'Bike checked out successfully');
      } else {
        const errText = await response.text();
        console.error('Checkout failed:', errText);
        Alert.alert('Error', errText || 'Failed to checkout bike');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      Alert.alert('Error', 'Failed to checkout bike');
    }
  };

  const handleReturnBike = async (station: StationData) => {
    // rider must have a reserved bike id
    const bikeId = checkoutBikeId;
    if (!bikeId) {
      Alert.alert('Error', 'No bike to return');
      return;
    }

    const riderId = (user as any)?.id ?? (user as any)?.userId ?? (user as any)?.sub ?? 1;

    const body = {
      riderId,
      stationId: station.id,
      bikeId
    };

    try {
      console.log('Returning bike with body:', body);
      const response = await fetch('http://localhost:8080/api/bikes/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Return response:', data);
        setHasCheckoutBike(false);
        setCheckoutBikeId(null);
        setSelectedStation(null);
        Alert.alert('Success', 'Bike returned successfully');
      } else {
        const errText = await response.text();
        console.error('Return failed:', errText);
        Alert.alert('Error', errText || 'Failed to return bike');
      }
    } catch (err) {
      console.error('Return error:', err);
      Alert.alert('Error', 'Failed to return bike');
    }
  };

  // Show modal after clicking Move Bike
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
        Alert.alert('Success', 'Bike moved successfully!');
      } else {
        const errorText = await response.text();
        Alert.alert('Error', errorText);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to move bike');
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
        hasCheckoutBike={hasCheckoutBike}
        onClose={() => setSelectedStation(null)}
        onReserveBike={handleReserveBike}
        onCheckoutBike={handleCheckoutBike}
        onReturnBike={handleReturnBike}
        onMoveBike={handleMoveBike}
        onMaintenanceBike={handleMaintenanceBike}
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
});