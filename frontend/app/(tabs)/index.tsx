import { View, StyleSheet } from "react-native";
import MapScreen from "@/components/Map";
import ImageViewer from '@/components/ImageViewer';
import Button from '@/components/SearchButton';

const PlaceholderImage = require('@/assets/images/bibixi_logo.png');


export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageViewer imgSource={PlaceholderImage} />
      </View>
      <View style={styles.mapContainer}>
        <MapScreen/>
      </View>
      <View style={styles.footerContainer}>
        <Button theme="primary" label="Find a bike" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff'
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
  imageContainer: {
    flex: 1,
  },
  mapContainer: {
    width: '100%',
    flex: 2,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
});
