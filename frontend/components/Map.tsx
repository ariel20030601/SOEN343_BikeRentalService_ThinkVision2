import { Platform } from 'react-native';
import MapWeb, { MapWebProps } from './Map.web';
import MapNative, { MapNativeProps } from './Map.native';


type MapScreenProps = MapWebProps & MapNativeProps;

export default function MapScreen(props: MapScreenProps) {
  if (Platform.OS === 'web') {
    return <MapWeb {...props} />;
  }
  return <MapNative {...props} />;
}