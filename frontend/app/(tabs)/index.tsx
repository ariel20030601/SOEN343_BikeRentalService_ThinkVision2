import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import MapScreen from "@/components/Map";
import SearchButton from '@/components/SearchButton'
import ProfileButton from "@/components/ProfileButton";
import InfoButton from "@/components/InfoButton";
import MapLegend from '@/components/MapLegend';

const PlaceholderImage = require('@/assets/images/bibixi_logo.png');

export default function Index() {


  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <ProfileButton />
        </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <InfoButton />
          </TouchableOpacity>

        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <SearchButton />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapScreen/>
      </View>

      <View style={styles.footer}>
        <MapLegend/>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F6F1",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: "#F9F6F1",
    position: "absolute",
    top: 0,
    zIndex: 10,
  },
  iconButton: {
    padding: 8,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    height: 80,
    width: 100,
  },
  mapContainer: {
    width: "100%",
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#F9F6F1",
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 10,
  },
});