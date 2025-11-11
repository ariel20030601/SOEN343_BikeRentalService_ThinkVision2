import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal, Pressable } from "react-native";
import { fetchAllUsers, fetchBillingHistory, TripSummary, User } from "@/api/auth/api";
import { useAuth } from "@/contexts/AuthContext";

export default function History() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [selected, setSelected] = useState<TripSummary | null>(null);

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
      <Text style={styles.title}>  Bike Trip Records</Text>

        <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerCell, { flex: 0.5 }]}>ID</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.2 }]}>Type of Bike</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Starting Point</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Finish Point</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Duration</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Cost</Text>
      </View>

      {trips.map((t, index) => (
        <TouchableOpacity
          key={t.tripId}
          style={[
            styles.row,
            { backgroundColor: index % 2 === 0 ? "#fff" : "#f8f8f8" },
          ]}
          onPress={() => setSelected(t)}
        >
          <Text style={[styles.cell, { flex: 0.6 }]}>{t.tripId}</Text>
          <Text style={[styles.cell, { flex: 1.2 }]}>{t.bikeType}</Text>
          <Text style={[styles.cell, { flex: 1.6 }]}>{t.startStationName}</Text>
          <Text style={[styles.cell, { flex: 1.6 }]}>{t.endStationName}</Text>
          <Text style={[styles.cell, { flex: 1 }]}>{t.durationMinutes} min</Text>
          <Text style={[styles.cell, { flex: 1 }]}>{`$${(t.cost ?? 0).toFixed(2)}`}</Text>
        </TouchableOpacity>
      ))}

      <TripDetailsModal
        visible={!!selected}
        onClose={() => setSelected(null)}
        trip={selected}
        riderName={username}
      />
    </ScrollView>
  );
}

function formatDate(millis: number) {
  if (!millis) return "-";
  const d = new Date(millis);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

function computeCostBreakdown(t?: TripSummary) {
  if (!t) return { base: 0, perMinute: 0, eBikeSurcharge: 0 };
  const minutes = Math.max(0, t.durationMinutes || 0);

  // Standard plan
  const STD_BASE = 10.0;
  const STD_RATE = 0.25;
  // E-bike plan
  const E_BASE = 15.0;
  const E_RATE = 0.50;

  const base = (t.bikeType || '').toUpperCase().includes('E') ? E_BASE : STD_BASE;
  const rate = (t.bikeType || '').toUpperCase().includes('E') ? E_RATE : STD_RATE;
  const extraMinutes = Math.max(0, minutes - 30);
  const perMinute = extraMinutes * rate;

  // Surcharge = difference vs standard plan for same minutes (informational only)
  const stdTotal = STD_BASE + Math.max(0, minutes - 30) * STD_RATE;
  const actualTotal = (t.cost ?? 0);
  const eBikeSurcharge = Math.max(0, actualTotal - stdTotal);

  return { base, perMinute, eBikeSurcharge };
}

function TripDetailsModal({ visible, onClose, trip, riderName }: { visible: boolean; onClose: () => void; trip: TripSummary | null; riderName: string }) {
  if (!trip) return null;
  const breakdown = computeCostBreakdown(trip);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Trip Details</Text>

          <Text style={styles.detailLine}>Trip ID: {trip.tripId}</Text>
          <Text style={styles.detailLine}>Rider: {riderName || '-'}</Text>
          <Text style={styles.detailLine}>Start Station: {trip.startStationName}</Text>
          <Text style={styles.detailLine}>End Station: {trip.endStationName}</Text>
          <Text style={styles.detailLine}>Start Time: {formatDate(trip.startTime)}</Text>
          <Text style={styles.detailLine}>End Time: {formatDate(trip.endTime)}</Text>
          <Text style={styles.detailLine}>Duration: {trip.durationMinutes} min</Text>
          <Text style={styles.detailLine}>Bike Type: {trip.bikeType}</Text>

          <View style={{ height: 10 }} />
          <Text style={styles.sectionTitle}>Cost Breakdown</Text>
          <Text style={styles.detailLine}>Base: ${breakdown.base.toFixed(2)}</Text>
          <Text style={styles.detailLine}>Per-minute: ${breakdown.perMinute.toFixed(2)}</Text>
          <Text style={styles.detailLine}>E-bike surcharge: ${breakdown.eBikeSurcharge.toFixed(2)}</Text>
          <Text style={[styles.detailLine, { fontWeight: '600' }]}>Total: ${Number(trip.cost ?? 0).toFixed(2)}</Text>

          <View style={{ height: 10 }} />
          <Text style={styles.sectionTitle}>Timeline</Text>
          <Text style={styles.detailLine}>• Checkout → {formatDate(trip.startTime)}</Text>
          <Text style={styles.detailLine}>• Return → {formatDate(trip.endTime)}</Text>

          <View style={{ height: 16 }} />
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={{ color: 'white', fontWeight: '600' }}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  modalCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center'
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  detailLine: {
    fontSize: 14,
    marginBottom: 2,
  },
  closeButton: {
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 4,
  },
});
