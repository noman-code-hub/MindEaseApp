import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Doctor } from '../services/doctorService';

interface DoctorProfileModalProps {
    visible: boolean;
    onClose: () => void;
    doctor: Doctor | null;
    onBook: () => void;
    onDetail: () => void;
}

const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({ visible, onClose, doctor, onBook, onDetail }) => {
    if (!doctor) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header: Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon name="close" size={24} color="#333" />
                    </TouchableOpacity>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.headerSection}>
                            <View style={styles.imageContainer}>
                                <Icon name="person" size={60} color="#5B7FFF" />
                            </View>
                            <Text style={styles.doctorName}>{doctor.name}</Text>
                            <Text style={styles.doctorSpecialty}>{doctor.specialization || doctor.role}</Text>
                            <Text style={styles.doctorEducation}>{doctor.education || "MBBS, FCPS"}</Text>
                        </View>

                        {/* Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{doctor.rating || 0}</Text>
                                <Text style={styles.statLabel}>Reviews</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{doctor.experience || "5+"}</Text>
                                <Text style={styles.statLabel}>Years Exp</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>100%</Text>
                                <Text style={styles.statLabel}>Satisfaction</Text>
                            </View>
                        </View>

                        {/* About Section */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>About</Text>
                            <Text style={styles.sectionText}>
                                {doctor.about || `Dr. ${doctor.name} is a highly skilled ${doctor.role} with over ${doctor.experience || 5} years of experience in treating patients with mental health conditions. Dedicated to providing compassionate care and evidence-based treatments.`}
                            </Text>
                        </View>

                        {/* Education & Experience */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Education & Experience</Text>
                            <View style={styles.infoRow}>
                                <Icon name="school-outline" size={18} color="#666" style={{ marginTop: 2 }} />
                                <Text style={styles.infoText}>{doctor.education || "MBBS, FCPS (Psychiatry)"}</Text>
                            </View>
                            <View style={[styles.infoRow, { marginTop: 8 }]}>
                                <Icon name="briefcase-outline" size={18} color="#666" style={{ marginTop: 2 }} />
                                <Text style={styles.infoText}>{doctor.experience ? `${doctor.experience} Years Experience` : "Experienced Specialist"}</Text>
                            </View>
                        </View>

                        {/* Location Card */}
                        <View style={styles.locationCard}>
                            <View style={styles.locationHeader}>
                                <Icon name="location-outline" size={20} color="#2D5BFF" />
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={styles.clinicName}>{doctor.clinicName || "MindEase Clinic"}</Text>
                                    <Text style={styles.clinicAddress}>{doctor.location || "Main Branch, City Center"}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Availability */}
                        {doctor.availability && doctor.availability.length > 0 && (
                            <View style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>Availability</Text>
                                <View style={styles.availabilityContainer}>
                                    {doctor.availability.map((slot, index) => (
                                        <View key={index} style={styles.slotBadge}>
                                            <Icon name="time-outline" size={14} color="#5B7FFF" />
                                            <Text style={styles.slotText}>
                                                {slot.day}: {slot.startTime} - {slot.endTime}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Actions */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.primaryButton} onPress={onBook}>
                                <Icon name="calendar-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.primaryButtonText}>Book Appointment</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#F3F4F6',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '80%',
        padding: 20,
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 5,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerSection: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: 20,
        backgroundColor: '#E8EFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#5B7FFF',
    },
    doctorName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1F3A',
        marginBottom: 4,
    },
    doctorSpecialty: {
        fontSize: 16,
        color: '#5B7FFF',
        fontWeight: '600',
        marginBottom: 2,
    },
    doctorEducation: {
        fontSize: 14,
        color: '#888',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF9F43',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
    },
    locationCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 10,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    clinicName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1F3A',
    },
    clinicAddress: {
        fontSize: 12,
        color: '#888',
    },
    actionButtons: {
        gap: 12,
        marginTop: 10
    },
    primaryButton: {
        backgroundColor: '#5DADEC',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: "#5DADEC",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#5DADEC',
    },
    secondaryButtonText: {
        color: '#5DADEC',
        fontSize: 16,
        fontWeight: '700',
    },
    // New Detailed Section Styles
    sectionContainer: {
        marginTop: 20,
        paddingHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1F3A',
        marginBottom: 10,
    },
    sectionText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    availabilityContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    slotBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4FF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
        borderWidth: 1,
        borderColor: '#E0E7FF',
    },
    slotText: {
        fontSize: 12,
        color: '#5B7FFF',
        fontWeight: '600',
    },
});

export default DoctorProfileModal;
