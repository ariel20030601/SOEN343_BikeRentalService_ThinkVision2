import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import RiderMap from './RiderMap.web';
import OperatorMap from './OperatorMap.web';
import VisitorMap from './VisitorMap.web';

export default function MapWeb() {
  const { user } = useAuth();
  const [overrideRole, setOverrideRole] = useState<string | null>(null);

  // Determine active role (from override or auth)
  const actualRole = user?.role?.toLowerCase() || 'visitor';
  const currentRole = overrideRole || actualRole;

  // Function to toggle between roles
  const toggleRole = () => {
    if (currentRole === 'rider') {
      setOverrideRole('operator');
    } else if (currentRole === 'operator') {
      setOverrideRole('rider');
    }
  };

  // Choose map based on role
  let MapComponent;
  if (currentRole === 'rider') {
    MapComponent = <RiderMap />;
  } else if (currentRole === 'operator') {
    MapComponent = <OperatorMap />;
  } else {
    MapComponent = <VisitorMap />;
  }

  return (
    <View style={{ flex: 1 }}>
      {MapComponent}

      {/* Toggle Button only visible for logged-in users */}
      {user && (
        <TouchableOpacity style={styles.toggleButton} onPress={toggleRole}>
          <Text style={styles.toggleText}>
            {currentRole === 'rider'
              ? 'Switch to Operator Mode'
              : 'Switch to Rider Mode'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 5,
  },
  toggleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
