import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapLegendCompact() {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <View style={[styles.dot, styles.green]} />
                <Text style={styles.text}>Balanced</Text>
                
                <View style={[styles.dot, styles.yellow]} />
                <Text style={styles.text}>At Risk</Text>
                
                <View style={[styles.dot, styles.red]} />
                <Text style={styles.text}>Empty/Full</Text>
                
                <Text style={styles.divider}>|</Text>
                
                <Text style={styles.eBadge}>E</Text>
                <Text style={styles.text}>E-Bike</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 10,
        borderRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 4,
        marginLeft: 8,
    },
    green: {
        backgroundColor: '#4CAF50',
    },
    yellow: {
        backgroundColor: '#FFC107',
    },
    red: {
        backgroundColor: '#F44336',
    },
    text: {
        fontSize: 12,
        color: '#555',
        marginRight: 4,
    },
    divider: {
        marginHorizontal: 8,
        color: '#ccc',
    },
    eBadge: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#2196F3',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 3,
        marginLeft: 8,
        marginRight: 4,
    },
});