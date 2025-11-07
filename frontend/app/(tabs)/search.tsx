import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { SearchBar } from "react-native-elements";

export interface StationData {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  availableBikes: number;
  freeDocks: number;
  status: string;
  docks?: {
    id: string;
    name: string;
    status: string;
    bike?: {
      id: string;
      type: "STANDARD" | "E_BIKE";
      status: string;
    };
  }[];
}

const Item: React.FC<{
  name: string;
  bikes: number;
  ebikes: number;
  docks: number;
  address: string;
  status: string;
}> = ({ name, bikes, ebikes, docks, address, status }) => (
  <View style={styles.item}>
    <View style={styles.titleContainer}>
      <Text style={styles.itemTitle}>{name}</Text>
    </View>
    <View style={styles.detailsContainer}>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Bikes</Text>
        <Text style={styles.detailValue}>{bikes}</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>E-Bikes</Text>
        <Text style={styles.detailValue}>{ebikes}</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Free Docks</Text>
        <Text style={styles.detailValue}>{docks}</Text>
      </View>
    </View>
    <Text style={styles.addressText}>{address}</Text>
    <Text style={styles.statusText}>Status: {status}</Text>
  </View>
);

const Search = () => {
  const [data, setData] = useState<StationData[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const arrayholder = useRef<StationData[]>([]);

  // Fetch from backend
  useEffect(() => {
    fetch("http://localhost:8080/api/stations")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stations");
        return res.json();
      })
      .then((json: StationData[]) => {
        setData(json);
        arrayholder.current = json;
      })
      .catch((err) => console.error("Failed to fetch stations:", err));
  }, []);

  const searchFunction = (text: string) => {
    const updateData = arrayholder.current.filter((item) => {
      const itemData = (item.name ?? "").toUpperCase();
      const textData = text.toUpperCase();
      return itemData.includes(textData);
    });
    setData(updateData);
    setSearchValue(text);
  };

  const renderItem = ({ item }: { item: StationData }) => {
    // Derive bike counts from docks
    let standardCount = 0;
    let eBikeCount = 0;
    if (item.docks) {
      for (const d of item.docks) {
        if (d.bike) {
          if (d.bike.type === "E_BIKE") eBikeCount++;
          else standardCount++;
        }
      }
    }

    return (
      <Item
        name={item.name}
        bikes={standardCount}
        ebikes={eBikeCount}
        docks={item.freeDocks ?? 0}
        address={item.address}
        status={item.status}
      />
    );
  };

  return (
    <View style={styles.container}>
        <SearchBar
        platform="default"
        placeholder="Search for a place or a station"
        lightTheme
        round
        value={searchValue}
        onChangeText={searchFunction as any}
        autoCorrect={false}
        showLoading={false}
        loadingProps={{}}
        onFocus={() => {}}
        onBlur={() => {}}
        onClear={() => {
            setSearchValue("");
            setData(arrayholder.current);
        }}
        onCancel={() => {}}            // ✅ required by types only
        cancelButtonTitle="Cancel"     // ✅ dummy default
        cancelButtonProps={{}}         // ✅ empty object
        showCancel={false}             // ✅ hide cancel button
        containerStyle={{
            backgroundColor: "white",
            borderTopWidth: 0,
            borderBottomWidth: 0,
            padding: 10,
            borderColor: "black",
        }}
        inputContainerStyle={{
            backgroundColor: "white",
            borderRadius: 10,
            padding: 10,
        }}
        searchIcon={{ name: "search", size: 24, color: "black" }}
        clearIcon={{ name: "clear", size: 24, color: "black" }}
        />


      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    padding: 10,
  },
  item: {
    backgroundColor: "#F15A29",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  itemTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    alignItems: "center",
  },
  detailLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  addressText: {
    color: "white",
    fontSize: 12,
    marginTop: 8,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
});

export default Search;
