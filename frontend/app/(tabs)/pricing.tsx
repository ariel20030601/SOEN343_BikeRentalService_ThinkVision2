import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

export default function Pricing() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <Text style={styles.title}> <Ionicons name="bicycle-outline" size={28} color="#f15a29" /> Bibixi: Prices</Text>

  
      <View style={styles.row}>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Regular Bikes</Text>
          <Text style={styles.text}>
          Price per hour: $2.00{"\n"}
          Price per day: $10.00{"\n"}
          Weekly pass: $25.00{"\n"}
          Monthly pass: $60.00
          </Text>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Capacity: Not applicalbe {"\n"}
            </Text>
          </View>
        </View>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>E-Bikes</Text>
          <Text style={styles.text}>
          Price per hour: $4.00{"\n"}
          Price per day: $20.00{"\n"}
          Weekly pass: $45.00{"\n"}
          Monthly pass: $100.00
          </Text>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Capacity: {"\n"}
              <li> Full Battery 100%: 12 hours of riding {"\n"}</li>
              <li> Medium Battery 50%: 6 hours of riding {"\n"}</li>
              <li> Low Battery 10%: 1 hour of riding {"\n"}</li>
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.guidelinesBox}>
        <Text style={styles.boxTitle}>General Guidelines</Text>
        <View style={styles.guidelineList}>
          <Text style={styles.listItem}>• When reserving and taking a bike, be vigilant for discrepency between the app's mentioned battery life and the amount displayed on the bike.</Text>
          <Text style={styles.listItem}>• When docking, gently enter the bike into an available dock and await the green light indicating a correct insertion, followed by a notification on the app</Text>
          <Text style={styles.listItem}>• If any trouble occurs, either bike breaking down or the app maulfunctioning, send an email to the following account: bibibxi-help@gmail.com .</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  box: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  text: {
    color: "#555",
    marginBottom: 10,
    paddingBottom: 10,
  },
  placeholder: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },
  placeholderText: {
    fontStyle: "italic",
    color: "#888",
  },
  guidelinesBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guidelineList: {
    marginTop: 8,
  },
  listItem: {
    color: "#555",
    marginBottom: 6,
  },
});