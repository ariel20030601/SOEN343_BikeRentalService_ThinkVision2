import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import { StationData } from '@/hardcode/stationsData';
import Markers from './Markers.web';
import StationDetailsPanel from '@/components/StationDetailsPanel';
import { Alert } from 'react-native';


export default function MapWeb() {
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [userRole] = useState<'rider' | 'operator'>('operator'); // TODO: Get from context
  const [hasReservedBike, setHasReservedBike] = useState(false);

  const handleReserveBike = (station: StationData) => {
    console.log('Reserve bike at', station.title);
    setHasReservedBike(true);
    setSelectedStation(null);
    // TODO: Implement actual reservation logic
  };

  const handleReturnBike = (station: StationData) => {
    console.log('Return bike to', station.title);
    setHasReservedBike(false);
    setSelectedStation(null);
    // TODO: Implement actual return logic
  };

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
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
    map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});