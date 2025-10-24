import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import api from "../../api/auth/api";

// ---------- Types ----------
type BikeStatus = "AVAILABLE" | "RESERVED" | "ON_TRIP";

interface Bike {
  id: string;
  status: BikeStatus;
}

interface Station {
  id: number;
  name: string;
  availableBikes: number;
  bikes: Bike[];
}

// ---------- Component ----------
const BikeScreen: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([
    {
      id: 1,
      name: "Downtown Dock",
      availableBikes: 3,
      bikes: [
        { id: "bike1", status: "AVAILABLE" },
        { id: "bike2", status: "RESERVED" },
        { id: "bike3", status: "AVAILABLE" },
        { id: "bike4", status: "AVAILABLE" },
        { id: "bike5", status: "RESERVED" },
      ],
    },
  ]);

  const riderId = "r1"; // Mock logged-in rider

  // --- API CALLS ---

  const reserveBike = async (stationId: number, bikeId: string): Promise<void> => {
    try {
      const res = await api.post("/bikes/reserve", {
        riderId,
        stationId,
        bikeId,
      });
      Alert.alert("Success", `Bike ${bikeId} reserved!`);
      console.log(res.data);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "An error occurred during reservation.";
      Alert.alert("Error", message);
      console.error("Reserve error:", err);
    }
  };

  const checkoutBike = async (stationId: number, bikeId: string): Promise<void> => {
    try {
      const res = await api.post("/bikes/checkout", {
        riderId,
        stationId,
        bikeId,
      });
      Alert.alert("Trip Started", `Bike ${bikeId} checked out.`);
      console.log(res.data);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "An error occurred during checkout.";
      Alert.alert("Error", message);
      console.error("Checkout error:", err);
    }
  };

  const returnBike = async (stationId: number, bikeId: string): Promise<void> => {
    try {
      const res = await api.post("/bikes/return", {
        riderId,
        stationId,
        bikeId,
      });
      Alert.alert("Returned", `Bike ${bikeId} returned!`);
      console.log(res.data);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "An error occurred during return.";
      Alert.alert("Error", message);
      console.error("Return error:", err);
    }
  };

  // --- UI ---
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {stations.map((station) => (
        <View key={station.id} style={styles.stationCard}>
          <Text style={styles.title}>{station.name}</Text>
          <Text>Available Bikes: {station.availableBikes}</Text>

          <View style={styles.bikesContainer}>
            {station.bikes.map((bike) => (
              <TouchableOpacity
                key={bike.id}
                style={[
                  styles.bikeButton,
                  bike.status === "AVAILABLE"
                    ? styles.available
                    : styles.reserved,
                ]}
                onPress={() => reserveBike(station.id, bike.id)}
              >
                <Text style={styles.bikeText}>{bike.id}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => checkoutBike(station.id, "bike1")}
            >
              <Text>Checkout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => returnBike(station.id, "bike1")}
            >
              <Text>Return</Text>
            </TouchableOpacity>
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
    justifyContent: "center",   
    backgroundColor: "#f4f6f8", 
  },
  stationCard: {
    backgroundColor: "#ffffff",
    width: "90%",               
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",      
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  bikesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",  
    gap: 10,
    marginTop: 10,
  },
  bikeButton: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  available: {
    backgroundColor: "#4CAF50",
  },
  reserved: {
    backgroundColor: "#FFC107",
  },
  bikeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",   
    marginTop: 15,
    gap: 15,                    
  },
  actionButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});

export default BikeScreen;