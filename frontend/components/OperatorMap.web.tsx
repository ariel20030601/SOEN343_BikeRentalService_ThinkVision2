import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Button, Alert } from 'react-native';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import Markers from './Markers.web';
import StationDetailsPanel from '@/components/StationDetailsPanel';
import { StationData } from '@/hardcode/stationsData';

export default function OperatorMap() {
  const [stations, setStations] = useState<StationData[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const { user } = useAuth();    
  const operatorId = user?.id || 2; // TODO: Get from user context
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

  // Show modal after clicking Move Bike
  const handleMoveBike = (station: StationData) => {
    const dock13 = station.docks?.find(dock => dock.name === "Dock 13" && dock.bike);
    if (!dock13?.bike) {
      Alert.alert('Error', 'No bike found in Dock 13');
      return;
    }
    setMoveBikeSource({ station, bikeId: dock13.bike.id });
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
        // Refresh stations
        const stationsResponse = await fetch('http://localhost:8080/api/stations');
        const updatedStations = await stationsResponse.json();
        setStations(updatedStations);
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
        // Refresh stations
        const stationsResponse = await fetch('http://localhost:8080/api/stations');
        const updatedStations = await stationsResponse.json();
        setStations(updatedStations);
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
          mapId={'AIzaSyCXEnqnsX-Sl1DevG3W1N8BBg7D2MdZwsU'}
        >
          <Markers 
            stations={stations} 
            onMarkerPress={setSelectedStation}
          />
        </Map>
      </APIProvider>

      <StationDetailsPanel
        visible={selectedStation !== null}
        station={selectedStation}
        userRole="operator"
        hasReservedBike={false}
        onClose={() => setSelectedStation(null)}
        onReserveBike={() => {}}
        onReturnBike={() => {}}
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