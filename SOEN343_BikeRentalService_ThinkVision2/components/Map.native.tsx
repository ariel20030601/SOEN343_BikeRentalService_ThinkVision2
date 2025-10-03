import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

export default function MapNative() {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1, height: 400, width: '100%' }}
      initialRegion={{
        latitude: 45.5017, // Montreal
        longitude: -73.5673,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    />
  );
}