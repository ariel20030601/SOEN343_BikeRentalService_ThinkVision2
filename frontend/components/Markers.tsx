import { Callout, Marker } from 'react-native-maps';
import { Alert, Text, View } from 'react-native';
import { markers } from '@/hardcode/markersData';

export default function Markers() {
    const onMarkerSelected = (marker: any) => {
        Alert.alert(marker.name);
    }

    const calloutPressed = (ev: any) => {
        console.log(ev)
    }

    return (
        <>
            {markers.map((marker, index) => (
                <Marker
                    key={index}
                    title={marker.name}
                    coordinate={marker}
                    onPress={() => onMarkerSelected(marker)}
                >
                    <Callout onPress={calloutPressed}>
                        <View style={{ padding: 10 }}>
                            <Text style={{ fontSize: 24 }}>Hello</Text>
                        </View>
                    </Callout>
                </Marker>
            ))}
        </>
    );
}