import React, { useState } from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Markers from './Markers';
import StationDetailsPanel from '@/components/StationDetailsPanel';
import { View, StyleSheet } from 'react-native';
import { StationData } from '@/hardcode/stationsData';

export default function MapNative() {
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

  const handleMoveBike = (station: StationData) => {
    console.log('Move bike from', station.title);
    // TODO: Navigate to destination picker or show modal
  };

  const handleMaintenanceBike = (station: StationData, dockIndex: number) => {
    console.log('Send to maintenance', station.title, dockIndex);
    setSelectedStation(null);
    // TODO: Implement maintenance logic
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 45.5017, // Montreal
          longitude: -73.5673,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        <Markers onMarkerPress={setSelectedStation} />
      </MapView>

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
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  legendPosition: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
});