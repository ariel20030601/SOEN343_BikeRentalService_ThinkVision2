import { Marker } from 'react-native-maps';
import { STATIONS_DATA, StationData } from '@/hardcode/stationsData';

interface MarkersProps {
  onMarkerPress: (station: StationData) => void;
}

export default function Markers({ onMarkerPress }: MarkersProps) {
  return (
    <>
      {STATIONS_DATA.map((station) => (
        <Marker
          key={station.id}
          title={station.title}
          description={`${parseInt(station.bikes) + parseInt(station.ebikes)} bikes available`}
          coordinate={{
            latitude: station.location.lat,
            longitude: station.location.lng
          }}
          onPress={() => onMarkerPress(station)}
          pinColor={getMarkerColor(station)}
        />
      ))}
    </>
  );
}

function getMarkerColor(station: StationData): string {
  const bikesAvailable = parseInt(station.bikes) + parseInt(station.ebikes);
  const fullnessPercent = (bikesAvailable / station.capacity) * 100;
  
  if (fullnessPercent === 0 || fullnessPercent === 100) return 'red';
  if (fullnessPercent < 25 || fullnessPercent > 85) return 'yellow';
  return 'green';
}