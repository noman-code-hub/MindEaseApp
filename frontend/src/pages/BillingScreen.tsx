import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const BillingScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Icon name="receipt-outline" size={60} color="#5B7FFF" />
                </View>
                <Text style={styles.title}>Billing & Earnings</Text>
                <Text style={styles.subtitle}>Track your appointments and earnings here.</Text>

                <View style={styles.placeholderCard}>
                    <Text style={styles.placeholderText}>Detailed billing records will appear here.</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F5F7FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1F3A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
    },
    placeholderCard: {
        width: '100%',
        padding: 24,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#EDEEF0',
        borderStyle: 'dashed',
    },
    placeholderText: {
        color: '#999',
        textAlign: 'center',
        fontSize: 14,
    },
});

export default BillingScreen;
