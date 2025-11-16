import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { reserveBike, checkoutBike, returnBike } from "@/api/auth/bmsAPI";

type BikeStatus = "AVAILABLE" | "RESERVED" | "ON_TRIP";

interface Bike {
  id: string;
  status: BikeStatus;
}

interface Station {
  id: string;
  name: string;
  bikes: Bike[];
}

const BikeScreen: React.FC = () => {
  // Hardcoded backend demo data
  const [stations, setStations] = useState<Station[]>([
    {
      id: "S1",
      name: "Downtown Station",
      bikes: [
        { id: "B5", status: "AVAILABLE" },
        { id: "B6", status: "AVAILABLE" },
      ],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const riderId = 1; // demo user (demoRider from DemoDataLoader)

  // ---------- Helpers ----------
  const updateBikeStatus = (
    stationId: string,
    bikeId: string,
    newStatus: BikeStatus
  ) => {
    setStations((prev) =>
      prev.map((station) =>
        station.id === stationId
          ? {
              ...station,
              bikes: station.bikes.map((b) =>
                b.id === bikeId ? { ...b, status: newStatus } : b
              ),
            }
          : station
      )
    );
  };

  // ---------- Actions ----------
  const handleReserve = async (stationId: string, bikeId: string) => {
    setLoading(true);
    try {
      const result = await reserveBike(riderId, stationId, bikeId);
      console.log("Reservation:", result);
      updateBikeStatus(stationId, bikeId, "RESERVED");
      Alert.alert("✅ Reserved", `Bike ${bikeId} reserved successfully!`);
    } catch (err: any) {
      Alert.alert("❌ Error", err.message || "Reservation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (stationId: string, bikeId: string) => {
    setLoading(true);
    try {
      const result = await checkoutBike(riderId, stationId, bikeId);
      console.log("Checkout:", result);
      updateBikeStatus(stationId, bikeId, "ON_TRIP");
      Alert.alert("🚴 Trip Started", `You checked out bike ${bikeId}.`);
    } catch (err: any) {
      Alert.alert("❌ Error", err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (stationId: string, bikeId: string) => {
    setLoading(true);
    try {
      const result = await returnBike(riderId, stationId, bikeId);
      console.log("Return:", result);
      updateBikeStatus(stationId, bikeId, "AVAILABLE");
      Alert.alert("🏁 Returned", `Bike ${bikeId} returned successfully!`);
    } catch (err: any) {
      Alert.alert("❌ Error", err.message || "Return failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Render ----------
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {stations.map((station) => (
        <View key={station.id} style={styles.stationCard}>
          <Text style={styles.title}>{station.name}</Text>
          <Text style={styles.subtitle}>Station ID: {station.id}</Text>

          <View style={styles.bikesContainer}>
            {station.bikes.map((bike) => (
              <TouchableOpacity
                key={bike.id}
                style={[
                  styles.bikeButton,
                  bike.status === "AVAILABLE"
                    ? styles.available
                    : bike.status === "RESERVED"
                    ? styles.reserved
                    : styles.onTrip,
                ]}
                onPress={() => {
                  if (bike.status === "AVAILABLE")
                    handleReserve(station.id, bike.id);
                  else if (bike.status === "RESERVED")
                    handleCheckout(station.id, bike.id);
                  else if (bike.status === "ON_TRIP")
                    handleReturn(station.id, bike.id);
                }}
              >
                <Text style={styles.bikeText}>{bike.id}</Text>
                <Text style={styles.statusText}>{bike.status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f4f6f8",
  },
  overlay: {
    position: "absolute",
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#007BFF",
  },
  stationCard: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#333",
  },
  subtitle: {
    color: "#555",
    marginBottom: 10,
  },
  bikesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  bikeButton: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  available: { backgroundColor: "#4CAF50" },
  reserved: { backgroundColor: "#FFC107" },
  onTrip: { backgroundColor: "#2196F3" },
  bikeText: { color: "white", fontWeight: "bold", fontSize: 18 },
  statusText: { color: "white", fontSize: 12 },
});

export default BikeScreen;
