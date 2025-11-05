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
}

export default function Markers({ onMarkerPress }: MarkersProps) {
  const [stations, setStations] = useState<StationData[]>([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/stations')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch stations');
        return res.json();
      })
      .then((json: StationData[]) => setStations(json))
      .catch((err) => console.error('Failed to fetch stations:', err));
  }, []);

  return (
    <>
      {stations.map((station) => (
        <AdvancedMarker
          key={station.id}
          position={{ lat: station.latitude, lng: station.longitude }}
          onClick={() => onMarkerPress(station)}
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
