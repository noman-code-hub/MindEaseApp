import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlansScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Plans</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
    },
});

export default PlansScreen;
