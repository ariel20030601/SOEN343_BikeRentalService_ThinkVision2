import { useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InfoButton() {
  const [isVisible, setIsVisible] = useState(false);

  const handlePress = () => {
    setIsVisible(true);
  };

  const handleReset = () => {
    // TODO: Implement reset functionality
    setIsVisible(false);
    // Show confirmation or handle reset
  };

  // TODO: Get user data from UserContext
  const userRole = "Rider"; // Placeholder
  const username = "JohnDoe"; // Placeholder
  
  // TODO: Get station data from StationContext
  const stationName = "Station A"; // Placeholder
  const bikes = 5; // Placeholder
  const capacity = 10; // Placeholder
  const freeDocks = capacity - bikes;

  return (
    <>
      <TouchableOpacity onPress={handlePress}>
        <Ionicons name="information-circle-outline" size={28} color="#333" />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable 
          style={styles.overlay} 
          onPress={() => setIsVisible(false)}
        >
          <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={styles.title}>Bibixi App Info</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>User Information</Text>
                <Text style={styles.infoText}>Role: {userRole}</Text>
                <Text style={styles.infoText}>Username: {username}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Selected Station</Text>
                <Text style={styles.infoText}>Station: {stationName}</Text>
                <Text style={styles.infoText}>Bikes Available: {bikes}</Text>
                <Text style={styles.infoText}>Capacity: {capacity}</Text>
                <Text style={styles.infoText}>Free Docks: {freeDocks}</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.button, styles.resetButton]} 
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>Reset Scenario</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.closeButton]} 
                onPress={() => setIsVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#ef4444',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: '#f3f4f6',
  },
  closeButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
});