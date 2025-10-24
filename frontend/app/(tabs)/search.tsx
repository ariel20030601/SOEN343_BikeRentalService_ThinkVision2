import React from "react";
import { StyleSheet, Text, View, FlatList} from "react-native";
import { SearchBar } from "react-native-elements";

interface StationData {
    id: string;
    title: string;
    bikes: string;
    ebikes: string;
    docks: string;
}

const DATA = [
    {id: "1", title: "Station 1", bikes: "13", ebikes: "0", docks: "10"},
    {id: "2", title: "Station 2", bikes: "10", ebikes: "5", docks: "11"},
    {id: "3", title: "Station 3", bikes: "9", ebikes: "0", docks: "5"}
];

const Item: React.FC<StationData> = ({ title, bikes, ebikes, docks }) => (
    <View style={styles.item}>
        <View style={styles.titleContainer}>
            <Text style={styles.itemTitle}>{title}</Text>
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
                <Text style={styles.detailLabel}>Docks</Text>
                <Text style={styles.detailValue}>{docks}</Text>
            </View>
        </View>
    </View>
);

const Search = () => {
    const [data, setData] = React.useState(DATA)
    const [searchValue, setSearchValue] = React.useState("");
    const arrayholder = React.useRef(DATA);

    const searchFunction = (text: string) => {
        const updateData = arrayholder.current.filter((item) => {
            const itemData = item.title.toUpperCase();
            const textData = text.toUpperCase();
            return itemData.includes(textData);
        });
        setData(updateData);
        setSearchValue(text);
    }

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
                onClear={() => {
                    setSearchValue("");
                    setData(DATA);
                }}
                onFocus={() => {}}
                onBlur={() => {}}
                onCancel={() => {}}
                cancelButtonTitle="Cancel"
                cancelButtonProps={{}}
                showCancel={false}
                containerStyle={{
                    backgroundColor: "white",
                    borderTopWidth: 0,
                    borderBottomWidth: 0,
                    padding: 10,
                    borderColor: "black"
                }}
                inputContainerStyle={{
                    backgroundColor: "white",
                    borderRadius: 10,
                    padding: 10,
                }}
                searchIcon={{ name: "search", size: 24, color: "black"}}
                clearIcon={{ name: "clear", size: 24, color: "black"}}
                cancelIcon={{ name: "cancel", size: 24, color: "black"}}
            />

            <FlatList
                data={data}
                renderItem={({ item }: { item: StationData }) => 
                    <Item 
                        id={item.id}
                        title={item.title}
                        bikes={item.bikes}
                        ebikes={item.ebikes}
                        docks={item.docks} />}
                keyExtractor={(item: StationData) => item.id}
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
        backgroundColor: '#F15A29',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius:8,
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
});

export default Search;