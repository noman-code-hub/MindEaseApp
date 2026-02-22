import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { seedSpecialities, getSpecialities, Speciality } from '../services/doctorService';
import { specialitiesData } from '../data/specialitiesData';
import { createResponsiveStyles } from '../utils/responsive';

export const SpecialitiesManagementScreen = () => {
    const [loading, setLoading] = useState(false);
    const [specialities, setSpecialities] = useState<Speciality[]>([]);

    const handleSeedSpecialities = async () => {
        setLoading(true);
        try {
            const result = await seedSpecialities(specialitiesData);
            if (result.success) {
                Alert.alert('Success', 'Specialities seeded successfully!');
            } else {
                Alert.alert('Error', result.message || 'Failed to seed specialities');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while seeding specialities');
        } finally {
            setLoading(false);
        }
    };

    const handleGetSpecialities = async () => {
        setLoading(true);
        try {
            const data = await getSpecialities();
            setSpecialities(data);
            Alert.alert('Success', `Fetched ${data.length} specialities`);
        } catch (error) {
            Alert.alert('Error', 'An error occurred while fetching specialities');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Specialities Management</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSeedSpecialities}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Processing...' : 'Seed Specialities'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary, loading && styles.buttonDisabled]}
                    onPress={handleGetSpecialities}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Processing...' : 'Get Specialities'}
                    </Text>
                </TouchableOpacity>
            </View>

            {specialities.length > 0 && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>Fetched Specialities ({specialities.length})</Text>
                    {specialities.map((spec, index) => (
                        <View key={index} style={styles.specialityCard}>
                            <Text style={styles.specialityName}>{spec.speciality}</Text>
                            {spec.super_specialities.map((superSpec, idx) => (
                                <View key={idx} style={styles.superSpeciality}>
                                    <Text style={styles.superSpecialityName}>• {superSpec.name}</Text>
                                    <View style={styles.servicesContainer}>
                                        {superSpec.services.map((service, sIdx) => (
                                            <Text key={sIdx} style={styles.service}>
                                                - {service}
                                            </Text>
                                        ))}
                                    </View>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

const styles = createResponsiveStyles({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonContainer: {
        gap: 15,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonSecondary: {
        backgroundColor: '#2196F3',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultsContainer: {
        marginTop: 20,
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    specialityCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    specialityName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 10,
    },
    superSpeciality: {
        marginLeft: 10,
        marginTop: 8,
    },
    superSpecialityName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 5,
    },
    servicesContainer: {
        marginLeft: 15,
    },
    service: {
        fontSize: 14,
        color: '#777',
        marginBottom: 2,
    },
});
