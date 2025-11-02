import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { STATIONS_DATA, StationData } from '@/hardcode/stationsData';

interface MarkersProps {
  onMarkerPress: (station: StationData) => void;
}

export default function Markers({ onMarkerPress }: MarkersProps) {
  return (
    <>
      {STATIONS_DATA.map((station) => (
        <AdvancedMarker
          key={station.id}
          position={{
            lat: station.location.lat,
            lng: station.location.lng
          }}
          onClick={() => onMarkerPress(station)}
          title={`${station.title} - ${parseInt(station.bikes) + parseInt(station.ebikes)} bikes available`}
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
  const bikesAvailable = parseInt(station.bikes) + parseInt(station.ebikes);
  const fullnessPercent = (bikesAvailable / station.capacity) * 100;
  
  if (fullnessPercent === 0 || fullnessPercent === 100) return '#ef4444'; // red
  if (fullnessPercent < 25 || fullnessPercent > 85) return '#eab308'; // yellow
  return '#22c55e'; // green
}