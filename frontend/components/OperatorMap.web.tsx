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

  const handleMoveBike = async (station: StationData) => {
    if (!station || !selectedStation) return;
    try {
      const response = await fetch(
        `http://localhost:8080/api/operator/move-bike?operatorId=${operatorId}&fromStationId=${station.id}&toStationId=S3&bikeId=${station.docks?.[0].bike?.id}`,
        { method: 'POST' }
      );
      if (response.ok) {
        Alert.alert('Success', 'Bike moved successfully!');
      } else {
        const errorText = await response.text();
        Alert.alert('Error', errorText);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to move bike');
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
        Alert.alert('❌ Error', errorText);
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
          mapId={'AIzaSyCXEnqnsX-Sl1DevG3W1N8BBg7D2MdZwsU'} // Required for AdvancedMarker
        >
          <Markers onMarkerPress={setSelectedStation} />
        </Map>
      </APIProvider>

      <StationDetailsPanel
        visible={selectedStation !== null}
        station={selectedStation}
        userRole={userRole}
        hasReservedBike={hasReservedBike}
        onClose={() => setSelectedStation(null)}
        onReserveBike={handleReserveBike}
        onReturnBike={handleReturnBike}
        onMoveBike={handleMoveBike}
        onMaintenanceBike={handleMaintenanceBike}
      />
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