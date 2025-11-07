import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { fetchAllUsers, fetchBillingHistory, TripSummary, User } from "@/api/auth/api";
import { useAuth } from "@/contexts/AuthContext";

export default function History() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trips, setTrips] = useState<TripSummary[]>([]);

  const username = (user?.username as string) || "";

  useEffect(() => {
    const run = async () => {
      if (!token || !username) return;
      setLoading(true);
      setError(null);
      try {
        
        const users: User[] = await fetchAllUsers(token);
        const me = users.find(u => u.username === username);
        if (!me) {
          throw new Error("Current user not found");
        }
        const history = await fetchBillingHistory(me.id);
        setTrips(history);
      } catch (e: any) {
        setError(e?.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token, username]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bike Trip Records</Text>

      {loading && (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator size="small" />
        </View>
      )}
      {error && (
        <Text style={{ color: "#b00020", textAlign: "center", marginBottom: 12 }}>{error}</Text>
      )}

      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerCell, { flex: 0.6 }]}>ID</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.2 }]}>Type of Bike</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.6 }]}>Starting Point</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.6 }]}>Finish Point</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Duration</Text>
      </View>

      {trips.map((t, index) => (
        <View
          key={t.tripId}
          style={[
            styles.row,
            { backgroundColor: index % 2 === 0 ? "#fff" : "#f8f8f8" },
          ]}
        >
          <Text style={[styles.cell, { flex: 0.6 }]}>{t.tripId}</Text>
          <Text style={[styles.cell, { flex: 1.2 }]}>{t.bikeType}</Text>
          <Text style={[styles.cell, { flex: 1.6 }]}>{t.startStationName}</Text>
          <Text style={[styles.cell, { flex: 1.6 }]}>{t.endStationName}</Text>
          <Text style={[styles.cell, { flex: 1 }]}>{t.durationMinutes} min</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  headerRow: {
    backgroundColor: "#e8e8e8",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cell: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  headerCell: {
    fontWeight: "600",
  },
});
