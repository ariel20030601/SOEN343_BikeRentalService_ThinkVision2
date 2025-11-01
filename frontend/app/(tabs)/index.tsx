import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import MapScreen from "@/components/Map";
import SearchButton from '@/components/SearchButton'
import ProfileButton from "@/components/ProfileButton";

const PlaceholderImage = require('@/assets/images/bibixi_logo.png');

export default function Index() {


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <ProfileButton/>
        </TouchableOpacity>
        <Image source={PlaceholderImage} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity style={styles.iconButton} >
          <SearchButton/>
        </TouchableOpacity>
      </View>
      <View style={styles.mapContainer}>
        <MapScreen/>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#F9F6F1',
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  iconButton: {
    padding: 8,
  },
  logo: {
    height: 80,
    width: 100,
  },
  text: {
    color: '#fff'
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
  mapContainer: {
    width: '100%',
    flex: 1,
  },
});