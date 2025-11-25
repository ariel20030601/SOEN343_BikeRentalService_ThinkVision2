import { router } from "expo-router";
import { View, StyleSheet, TouchableOpacity, Image, Text } from "react-native";
import MapScreen from "@/components/Map";
import SearchButton from '@/components/SearchButton'
import ProfileButton from "@/components/ProfileButton";
import InfoButton from "@/components/InfoButton";
import MapLegend from '@/components/MapLegend';
import { useAuth } from '@/contexts/AuthContext';

const PlaceholderImage = require('@/assets/images/bibixi_logo.png');

export default function Index() {

  const { user } = useAuth();
  const username = user?.username;

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <ProfileButton />
        </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <InfoButton userRole={'RIDER'} />
          </TouchableOpacity>

        {(username && username.toLowerCase().includes('operator')) && (
          <TouchableOpacity style={styles.switchButton} onPress={() => router.push('/(tabs)/operatorMap')}>
            <Text style={styles.switchButtonText}>Switch to Operator Map</Text>
          </TouchableOpacity>
        )}
        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <SearchButton />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapContainer}>
        {!user ? (
          <MapScreen userRole="visitor"/>
        ) : (
          <MapScreen userRole="rider"/>
        )}
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

  switchButton: {
  paddingVertical: 10,
  paddingHorizontal: 18,
  backgroundColor: "#4A90E2",       
  borderRadius: 20,
  marginHorizontal: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,                      
},

  switchButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});