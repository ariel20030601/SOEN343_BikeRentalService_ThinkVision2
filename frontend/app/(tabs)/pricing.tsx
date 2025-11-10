// app/(tabs)/pricing.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getPricingPlans, PricingPlan } from "../../api/auth/api";

export default function Pricing() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getPricingPlans();
        if (mounted) setPlans(data || []);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load pricing plans");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        <Ionicons name="bicycle-outline" size={28} color="#f15a29" /> Bibixi: Prices
      </Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f15a29" />
          <Text style={styles.loadingText}>Loading pricing plans…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : plans.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.text}>No pricing plans available.</Text>
        </View>
      ) : (
        <View style={styles.flexcont}>
            {plans.map((plan, i) => (
              <View key={plan.name ?? i} style={styles.planCard}>
                <Text style={styles.planTitle}>{plan.name ?? "Unnamed Plan"}</Text>

                {/* baseFare: render only if not null/undefined and is a valid number */}
                {plan.baseFare != null && !Number.isNaN(Number(plan.baseFare)) && (
                  <Text style={styles.text}>Base fare: ${Number(plan.baseFare).toFixed(2)}</Text>
                )}

                {/* pricePerMinute: same safe check; handles 0.25 correctly */}
                {plan.pricePerMinute != null && !Number.isNaN(Number(plan.pricePerMinute)) && (
                  <Text style={styles.text}>Price per minute: ${Number(plan.pricePerMinute).toFixed(2)}</Text>
                )}
              </View>
            ))}
        </View>
      )}

      <View style={styles.guidelinesBox}>
        <Text style={styles.boxTitle}>General Guidelines</Text>
        <View style={styles.guidelineList}>
          <Text style={styles.listItem}>• When reserving and taking a bike, check battery vs. app display.</Text>
          <Text style={styles.listItem}>• When docking, insert bike into an available dock and wait for the green light and app notification.</Text>
          <Text style={styles.listItem}>• If any trouble occurs, email: bibibxi-help@gmail.com</Text>
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
  center: {
    alignItems: "center",
    marginVertical: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  flexcont:{
    flexDirection: "row",
    flexWrap: "wrap",
    display: "flex",
    justifyContent: "space-between",
      },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "49%",
    height: 200,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  planDesc: {
    color: "#666",
    marginBottom: 8,
  },
  text: {
    color: "#555",
    marginBottom: 6,
  },
  meta: {
    marginTop: 8,
  },
  metaItem: {
    color: "#777",
    fontSize: 13,
    marginBottom: 4,
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
  },
  errorText: {
    color: "#b00020",
  },
  guidelinesBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  guidelineList: {
    marginTop: 8,
  },
  listItem: {
    color: "#555",
    marginBottom: 6,
  },
});
