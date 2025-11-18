import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal, Pressable, TextInput } from "react-native";
import { fetchAllUsers, User } from "@/api/auth/dashboardAPI";
import { TripSummary } from '@/api/auth/histAPI';
import { fetchBillingHistory } from '@/api/auth/prcAPI';
import { useAuth } from "@/contexts/AuthContext";

export default function History() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [selected, setSelected] = useState<TripSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState<string>("");     // YYYY-MM-DD
  const [bikeFilter, setBikeFilter] = useState<"ALL" | "STANDARD" | "E_BIKE">("ALL");
  // Operator state to enable viewing other users' rides
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isOperator, setIsOperator] = useState<boolean>(false);
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  const username = (user?.username as string) || "";
  // If operator and no specific user selected, show All Users
  const displayUsername = isOperator && !selectedUserName ? 'All Users' : (isOperator ? (selectedUserName || username) : username);

  useEffect(() => {
    const run = async () => {
      if (!token || !username) return;
      setLoading(true);
      setError(null);
      try {
        const users: User[] = await fetchAllUsers(token);
        setAllUsers(users);
        const me = users.find(u => u.username === username);
        if (!me) throw new Error("Current user not found");
        // Determine role from backend user record (role field may exist)
        const role = ((me as any).role || "").toString().toUpperCase();
        const operator = role === "OPERATOR";
        setIsOperator(operator);
        if (operator) {
          // Default operator view: load all users' rides
          setSelectedUserName("");
          const histories = await Promise.all(
            users.map(async (u) => {
              try {
                const h = await fetchBillingHistory(u.id);
                return h.map(t => ({ ...t, userName: u.username } as any));
              } catch {
                return [] as any[];
              }
            })
          );
          const merged = histories.flat();
          merged.sort((a: any, b: any) => (b.startTime ?? 0) - (a.startTime ?? 0));
          setTrips(merged as any);
        } else {
          setSelectedUserName(me.username);
          const history = await fetchBillingHistory(me.id);
          setTrips(history);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token, username]);

  const applyOperatorUser = async () => {
    if (!isOperator) return;
    setError(null);
    setLoading(true);
    try {
      if (!selectedUserName) {
        // Show all users again
        const histories = await Promise.all(
          allUsers.map(async (u) => {
            try {
              const h = await fetchBillingHistory(u.id);
              return h.map(t => ({ ...t, userName: u.username } as any));
            } catch {
              return [] as any[];
            }
          })
        );
        const merged = histories.flat();
        merged.sort((a: any, b: any) => (b.startTime ?? 0) - (a.startTime ?? 0));
        setTrips(merged as any);
        return;
      }
      const found = allUsers.find(u => u.username === selectedUserName);
      if (!found) throw new Error("User not found");
      const history = await fetchBillingHistory(found.id);
      setTrips(history.map(t => ({ ...t, userName: found.username } as any)) as any);
    } catch (e: any) {
      setError(e?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  // Operator apply action removed

  const parseDate = (s: string, endOfDay = false) => {
    if (!s) return undefined as number | undefined;
    const parts = s.split("-");
    if (parts.length !== 3) return undefined;
    const [y, m, d] = parts.map(n => Number(n));
    if (!y || !m || !d) return undefined;
    const date = new Date(y, m - 1, d, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
    return date.getTime();
  };

  const filteredTrips = useMemo(() => {
    let list = trips;

    // Trip ID search
    if (searchTerm.trim()) {
      const id = Number(searchTerm.trim());
      list = Number.isNaN(id) ? [] : list.filter(t => t.tripId === id);
    }

    // Date range filter (inclusive)
    const startMs = parseDate(startDate, false);
    const endMs = parseDate(endDate, true);
    if (startMs !== undefined) {
      list = list.filter(t => (t.startTime || 0) >= startMs);
    }
    if (endMs !== undefined) {
      list = list.filter(t => (t.endTime || t.startTime || 0) <= endMs);
    }

    // Bike type filter
    if (bikeFilter !== "ALL") {
      const isE = bikeFilter === "E_BIKE";
      list = list.filter(t => {
        const v = (t.bikeType || "").toUpperCase();
        const ebike = v.includes("E");
        return isE ? ebike : !ebike;
      });
    }

    return list;
  }, [trips, searchTerm, startDate, endDate, bikeFilter]);

  const noResults = !loading && !error && filteredTrips.length === 0;

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setBikeFilter("ALL");
  };

  return (

    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Trip History Records</Text>
      <Text style={{ textAlign: 'center', marginBottom: 8, color: '#555' }}>User: {displayUsername || '-'}</Text>

      {isOperator && (
        <View style={styles.operatorRow}>
          <Text style={styles.filterLabel}>Operator: View user</Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TextInput
              style={[styles.searchInput, { flex: 0.8 }]}
              placeholder="Enter username"
              value={selectedUserName}
              onChangeText={setSelectedUserName}
              autoCapitalize="none"
            />
            <Pressable style={styles.applyBtn} onPress={applyOperatorUser}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Trip ID"
          keyboardType="number-pad"
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
        />
        {searchTerm.length > 0 && (
          <Pressable style={styles.clearBtn} onPress={() => setSearchTerm("")}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {/* Filter row: date range + bike type */}
      <View style={styles.filterRow}>
        <View style={styles.dateCol}>
          <Text style={styles.filterLabel}>Start</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={setStartDate}
            inputMode="numeric"
          />
        </View>
        <View style={styles.dateCol}>
          <Text style={styles.filterLabel}>End</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChangeText={setEndDate}
            inputMode="numeric"
          />
        </View>
        <View style={styles.typeCol}>
          <Text style={styles.filterLabel}>Bike</Text>
          <View style={styles.typeChips}>
            <Pressable
              style={[styles.chip, bikeFilter === "ALL" && styles.chipActive]}
              onPress={() => setBikeFilter("ALL")}
            >
              <Text style={[styles.chipText, bikeFilter === "ALL" && styles.chipTextActive]}>All</Text>
            </Pressable>
            <Pressable
              style={[styles.chip, bikeFilter === "STANDARD" && styles.chipActive]}
              onPress={() => setBikeFilter("STANDARD")}
            >
              <Text style={[styles.chipText, bikeFilter === "STANDARD" && styles.chipTextActive]}>Standard</Text>
            </Pressable>
            <Pressable
              style={[styles.chip, bikeFilter === "E_BIKE" && styles.chipActive]}
              onPress={() => setBikeFilter("E_BIKE")}
            >
              <Text style={[styles.chipText, bikeFilter === "E_BIKE" && styles.chipTextActive]}>E‑Bike</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.filterActions}>
        <Pressable style={styles.clearAllBtn} onPress={() => { setSearchTerm(""); setStartDate(""); setEndDate(""); setBikeFilter("ALL"); }}>
          <Text style={styles.clearAllText}>Clear Filters</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={{ paddingVertical: 20 }}>
          <ActivityIndicator size="small" />
        </View>
      )}
      {error && (
        <Text style={{ color: "#b00020", textAlign: "center", marginBottom: 12 }}>{error}</Text>
      )}
      {noResults && (
        <View style={{ paddingVertical: 8 }}>
          <Text style={{ color: "#555", textAlign: "center", marginBottom: 8 }}>
            No rides found. Try clearing filters or check the Trip ID.
          </Text>
          <Pressable style={[styles.clearAllBtn, { alignSelf: 'center' }]} onPress={clearFilters}>
            <Text style={styles.clearAllText}>Clear Filters</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerCell, { flex: 0.6 }]}>ID</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.2 }]}>User</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.2 }]}>Type of Bike</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.6 }]}>Starting Point</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.6 }]}>Finish Point</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Duration</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Cost</Text>
      </View>

      {filteredTrips.map((t, index) => (
        <TouchableOpacity
          key={t.tripId}
          style={[
            styles.row,
            { backgroundColor: index % 2 === 0 ? "#fff" : "#f8f8f8" },
          ]}
          onPress={() => setSelected(t)}
        >
          <Text style={[styles.cell, { flex: 0.6 }]}>{t.tripId}</Text>
          <Text style={[styles.cell, { flex: 1.2 }]}>{(isOperator && (t as any).userName) ? (t as any).userName : (displayUsername || '-')}</Text>
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

  // Surcharge = difference vs standard plan for same minutes
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
  operatorRow: {
    marginBottom: 8,
  },
  applyBtn: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyBtnText: { color: '#fff', fontWeight: '600' },
  searchBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  clearBtn: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearBtnText: {
    color: '#333',
    fontWeight: '600',
  },
  // removed operator styles
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  dateCol: { flex: 1 },
  typeCol: { flex: 1.5 },
  filterLabel: { fontSize: 12, color: '#444', marginBottom: 4 },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  typeChips: { flexDirection: 'row', gap: 6 },
  chip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff' },
  filterActions: { alignItems: 'flex-end', marginBottom: 8 },
  clearAllBtn: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearAllText: { color: '#333', fontWeight: '600' },
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
