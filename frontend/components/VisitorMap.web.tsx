import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import Markers from './Markers.web';
import { StationData } from '@/hardcode/stationsData';

export default function VisitorMap() {
  const [stations, setStations] = useState<StationData[]>([]);

  useEffect(() => {
    async function fetchStations() {
      try {
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
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {/* Non-clickable markers for visitors */}
          <Markers 
            stations={stations} 
            onMarkerPress={() => {}} // Disable interactivity
          />
        </Map>
      </APIProvider>
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
