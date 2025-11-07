import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { View, StyleSheet} from 'react-native';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import Markers from './Markers.web';
import StationDetailsPanel from '@/components/StationDetailsPanel';
import { StationData } from '@/hardcode/stationsData';

export default function RiderMap() {
  const [stations, setStations] = useState<StationData[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [hasReservedBike, setHasReservedBike] = useState(false);
  const { user } = useAuth();


  useEffect(() => {
    async function fetchStations() {
      try {
        const response = await fetch('http://localhost:8080/api/stations');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setStations(data);
      } catch (err) {
        console.error("Failed to fetch stations", err);
      }
    }
    fetchStations();
  }, []);

  const handleReserveBike = async (station: StationData) => {
    if (!user?.id) {
      console.log('User not authenticated');
      return;
    }

    try {
      const availableBike = station.docks?.find(
        dock => dock.bike && dock.bike.status === 'AVAILABLE'
      )?.bike;

      if (!availableBike) {
        console.log('No available bikes at this station');
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/rider/reserve-bike?riderId=${user.id}&bikeId=${availableBike.id}`,
        { method: 'POST' }
      );

      if (response.ok) {
        console.log('Bike reserved successfully!');
        setHasReservedBike(true);
        setSelectedStation(null);
        const stationsResponse = await fetch('http://localhost:8080/api/stations');
        const updatedStations = await stationsResponse.json();
        setStations(updatedStations);
      } else {
        const errorText = await response.text();
        console.log('Reserve bike failed:', errorText);
      }
    } catch (err) {
      console.error('Reserve bike error:', err);
    }
  };

  const handleReturnBike = async (station: StationData) => {
    if (!user?.id) {
      console.log('User not authenticated');
      return;
    }

    try {
      const emptyDock = station.docks?.find(dock => !dock.bike && dock.status === 'AVAILABLE');
      if (!emptyDock) {
        console.log('No available docks at this station');
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/rider/return-bike?riderId=${user.id}&stationId=${station.id}`,
        { method: 'POST' }
      );

      if (response.ok) {
        console.log('Bike returned successfully!');
        setHasReservedBike(false);
        setSelectedStation(null);
        const stationsResponse = await fetch('http://localhost:8080/api/stations');
        const updatedStations = await stationsResponse.json();
        setStations(updatedStations);
      } else {
        const errorText = await response.text();
        console.log('Return bike failed:', errorText);
      }
    } catch (err) {
      console.error('Return bike error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <APIProvider apiKey={'AIzaSyCXEnqnsX-Sl1DevG3W1N8BBg7D2MdZwsU'}>
        <Map
          style={styles.map}
          defaultCenter={{ lat: 45.5017, lng: -73.5673 }}
          defaultZoom={13}
          gestureHandling="greedy"
          disableDefaultUI={false}
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
        userRole="rider"
        hasReservedBike={hasReservedBike}
        onClose={() => setSelectedStation(null)}
        onReserveBike={handleReserveBike}
        onReturnBike={handleReturnBike}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  switchButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 5,
  },
  switchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
