import { Platform } from 'react-native';
import MapWeb from './MapWeb';
import MapNative from './MapNative';

const MapScreen = Platform.OS === 'web' ? MapWeb : MapNative;

export default MapScreen;