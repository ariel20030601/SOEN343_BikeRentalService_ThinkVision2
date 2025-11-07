import React, { useEffect, useState } from 'react';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

export interface StationData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  availableBikes: number;
  freeDocks: number;
  status: string;
  docks?: {
    id: string;
    name: string;
    status: string;
    bike?: {
      id: string;
      type: 'STANDARD' | 'E_BIKE';
      status: string;
    };
  }[];
}

interface MarkersProps {
  onMarkerPress: (station: StationData) => void;
  stations?: StationData[]; // <-- make it optional
}

export default function Markers({ onMarkerPress, stations: propsStations }: MarkersProps) {
  const [stations, setStations] = useState<StationData[]>(propsStations || []);

  useEffect(() => {

    if (propsStations && propsStations.length > 0) return;

    fetch('http://localhost:8080/api/stations')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch stations');
        return res.json();
      })
      .then((json: StationData[]) => {
        console.log('Fetched stations:', json);
        setStations(json);
      })
      .catch((err) => console.error('Failed to fetch stations:', err));
  }, [propsStations]);

  return (
    <>
      {stations.map((station) => (
        <AdvancedMarker
          key={station.id}
          position={{
            lat: station.latitude,
            lng: station.longitude
          }}
          onClick={() => {
            console.log(`Clicked marker for ${station.name}`);
            onMarkerPress(station);
          }}
          title={`${station.name} - ${station.availableBikes} bikes available`}
        >
          <Pin
            background={getMarkerColor(station)}
            borderColor="#fff"
            glyphColor="#fff"
          />
        </AdvancedMarker>
      ))}
    </>
  );
}

function getMarkerColor(station: StationData): string {
  const fullnessPercent = (station.availableBikes / station.capacity) * 100;

  if (fullnessPercent === 0 || fullnessPercent === 100) return '#ef4444'; // red
  if (fullnessPercent < 25 || fullnessPercent > 85) return '#eab308'; // yellow
  return '#22c55e'; // green
}
