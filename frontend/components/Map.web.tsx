import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import { StationData } from '@/hardcode/stationsData';
import { STATIONS_DATA } from '@/hardcode/stationsData';
import Markers from './Markers.web';
import StationDetailsPanel from '@/components/StationDetailsPanel';


export default function MapWeb() {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [userRole] = useState<'rider' | 'operator'>('operator'); // TODO: Get from context
  const [hasReservedBike, setHasReservedBike] = useState(false);
  const [stations, setStations] = useState(STATIONS_DATA);

  // Find the currently selected station from the stations array
  const selectedStation = selectedStationId 
    ? stations.find(s => s.id === selectedStationId) || null 
    : null;

  const handleReserveBike = (station: StationData) => {
    console.log('Reserve bike at', station.title);
    setHasReservedBike(true);
    setSelectedStationId(null);
    // TODO: Implement actual reservation logic
  };

  const handleReturnBike = (station: StationData) => {
    console.log('Return bike to', station.title);
    setHasReservedBike(false);
    setSelectedStationId(null);
    // TODO: Implement actual return logic
  };

  const handleMoveBike = (station: StationData) => {
    console.log('Move bike from', station.title);
    // TODO: Navigate to destination picker or show modal
  };

  const handleMaintenanceBike = (station: StationData, dockIndex: number) => {
    console.log('Send to maintenance', station.title, dockIndex);
    setSelectedStationId(null);
    // TODO: Implement maintenance logic
  };

  const handleAddBikes = (station: StationData, standardCount: number, ebikeCount: number) => {
    console.log(`Adding ${standardCount} standard bikes and ${ebikeCount} e-bikes to ${station.title}`);
    
    // Update the station's bike counts in the stations array
    setStations(prevStations => 
      prevStations.map(s => 
        s.id === station.id 
          ? {
              ...s,
              bikes: String(parseInt(s.bikes) + standardCount),
              ebikes: String(parseInt(s.ebikes) + ebikeCount),
              docks: String(parseInt(s.docks) - standardCount - ebikeCount),
            }
          : s
      )
    );
    
    // No need to update selectedStation separately - it will be found from stations array
  };

  const handleMarkerPress = (station: StationData) => {
    setSelectedStationId(station.id);
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
          <Markers onMarkerPress={handleMarkerPress} stations={stations} />
        </Map>
      </APIProvider>

      <StationDetailsPanel
        visible={selectedStation !== null}
        station={selectedStation}
        userRole={userRole}
        hasReservedBike={hasReservedBike}
        onClose={() => setSelectedStationId(null)}
        onReserveBike={handleReserveBike}
        onReturnBike={handleReturnBike}
        onMoveBike={handleMoveBike}
        onMaintenanceBike={handleMaintenanceBike}
        onAddBikes={handleAddBikes}
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