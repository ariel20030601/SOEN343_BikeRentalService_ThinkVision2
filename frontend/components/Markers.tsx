import { Callout, Marker } from 'react-native-maps';
import { Alert, Text, View } from 'react-native';

const markers = [
	{
		latitude: 45.4948,
		longitude: -73.5779,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
		name: 'Concordia University SGW Campus'
	},
	{
		latitude: 45.4581,
		longitude: -73.6391,
		latitudeDelta: 0.01,
		longitudeDelta: 0.01,
		name: 'Concordia University Loyola Campus'
	}
];

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