import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function History() {
  const data = [
    { id: 1, type: "Regular", start: "Saint-Catherine", finish: "Mont Royal", duration: "15 min" },
    { id: 2, type: "E-Bike", start: "Cote des Neiges", finish: "Vieux-Port", duration: "22 min" },
    { id: 3, type: "Regular", start: "Concordia University", finish: "Longeuil", duration: "10 min" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>  Bike Trip Records</Text>

        <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerCell, { flex: 0.5 }]}>ID</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.2 }]}>Type of Bike</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Starting Point</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1.5 }]}>Finish Point</Text>
        <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Duration</Text>
      </View>

      {data.map((item, index) => (
        <View
          key={item.id}
          style={[
            styles.row,
            { backgroundColor: index % 2 === 0 ? "#fff" : "#f8f8f8" },
          ]}
        >
          <Text style={[styles.cell, { flex: 0.5 }]}>{item.id}</Text>
          <Text style={[styles.cell, { flex: 1.2 }]}>{item.type}</Text>
          <Text style={[styles.cell, { flex: 1.5 }]}>{item.start}</Text>
          <Text style={[styles.cell, { flex: 1.5 }]}>{item.finish}</Text>
          <Text style={[styles.cell, { flex: 1 }]}>{item.duration}</Text>
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