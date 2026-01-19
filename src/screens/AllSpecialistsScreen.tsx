import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

// Reusing the Specialist interface and data (ideally this should be in a shared data file)
interface Specialist {
    id: number;
    name: string;
    role: string;
    rating: number;
    color: string;
}

const SPECIALISTS: Specialist[] = [
    { id: 1, name: 'Dr. Sarah Johnson', role: 'Clinical Psych', rating: 4.8, color: '#4ECDC4' },
    { id: 2, name: 'Dr. Michael Chen', role: 'Psychiatrist', rating: 4.9, color: '#5B7FFF' },
    { id: 3, name: 'Dr. Emma Wilson', role: 'Therapist', rating: 4.7, color: '#A78BFA' },
    { id: 4, name: 'Dr. Robert Fox', role: 'Neurologist', rating: 4.9, color: '#FFB06B' }, // Added more for demo
    { id: 5, name: 'Dr. Lily Evans', role: 'Psychologist', rating: 4.6, color: '#FF6B9D' },
];

const AllSpecialistsScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#1A1F3A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Specialists</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                {SPECIALISTS.map((specialist, index) => (
                    <View key={specialist.id} style={styles.cardWrapper}>
                        <View style={styles.specialistCard}>
                            <View style={styles.doctorImageContainer}>
                                <Icon name="person-circle" size={60} color={specialist.color} />
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={styles.doctorName}>{specialist.name}</Text>
                                <Text style={styles.specialityText}>{specialist.role}</Text>
                                <View style={styles.ratingContainer}>
                                    <Icon name="star" size={14} color="#FFD700" />
                                    <Text style={styles.ratingText}>{specialist.rating} (120+ Reviews)</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.bookButton}>
                                <Text style={styles.bookButtonText}>Book</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1F3A',
    },
    listContainer: {
        padding: 16,
        gap: 16,
    },
    cardWrapper: {
        marginBottom: 16,
    },
    specialistCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20, // Neumorphic
        padding: 16,
        // Neumorphic Shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
    },
    doctorImageContainer: {
        marginRight: 16,
    },
    cardInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1F3A',
        marginBottom: 4,
    },
    specialityText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    bookButton: {
        backgroundColor: '#5B7FFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        shadowColor: "#5B7FFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    bookButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 12,
    },
});

export default AllSpecialistsScreen;
