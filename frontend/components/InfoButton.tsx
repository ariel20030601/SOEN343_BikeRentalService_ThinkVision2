import { TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InfoButton() {
  const handlePress = () => {
    // TODO: Get user data from UserContext
    const userRole = "Rider"; // Placeholder
    const username = "JohnDoe"; // Placeholder
    
    // TODO: Get station data from StationContext
    const stationName = "Station A"; // Placeholder
    const bikes = 5; // Placeholder
    const capacity = 10; // Placeholder
    const freeDocks = capacity - bikes;

    const userInfo = `Role: ${userRole}\nUsername: ${username}`;
    const stationInfo = `Station: ${stationName}\nBikes Available: ${bikes}\nCapacity: ${capacity}\nFree Docks: ${freeDocks}`;

    Alert.alert(
      "Bibixi App Info",
      `${userInfo}\n\n${stationInfo}`,
      [
        {
          text: "Reset Scenario",
          onPress: () => {
            // TODO: Implement reset functionality
            Alert.alert("Reset Complete", "User and station data have been restored to initial state.");
          },
          style: "destructive"
        },
        {
          text: "Close",
          style: "cancel"
        }
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Ionicons name="information-circle-outline" size={28} color="#333" />
    </TouchableOpacity>
  );
}