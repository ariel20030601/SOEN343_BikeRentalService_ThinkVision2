import React from 'react';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { StationData } from '@/hardcode/stationsData';

interface MarkersProps {
  stations: StationData[];
  onMarkerPress: (station: StationData) => void;
}

export default function Markers({ stations, onMarkerPress }: MarkersProps) {
  if (!stations || stations.length === 0) {
    console.warn('No stations to display on map');
    return null;
  }

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
