import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Image,
    Modal,
    FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchDoctors, getSpecialities, Doctor, Speciality } from '../services/doctorService';
import { Calendar } from 'react-native-calendars';
import { bookAppointment } from '../services/appointmentService';
import DoctorProfileModal from '../components/DoctorProfileModal';
import { Alert } from 'react-native';

// Debounce helper
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const AllSpecialistsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { initialQuery, specialityId } = (route.params as { initialQuery?: string; specialityId?: string }) || {};

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState(initialQuery || '');
    const [specialities, setSpecialities] = useState<Speciality[]>([]);
    const [selectedSpecialityId, setSelectedSpecialityId] = useState<string | undefined>(specialityId);

    // Booking State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
    const [bookingReason, setBookingReason] = useState('');
    const [appointmentTypeFilter, setAppointmentTypeFilter] = useState<'online' | 'physical' | null>(null);

    // Patient Form State
    const [patientName, setPatientName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [patientEmail, setPatientEmail] = useState('');

    // Profile Modal State
    const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
    // patientId should ideally come from auth context/storage
    const [patientId, setPatientId] = useState<string | null>(null);

    // Debounced search query to avoid too many API calls
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        fetchSpecialities();
    }, []);

    useEffect(() => {
        fetchDoctors();
    }, [debouncedQuery, selectedSpecialityId]);

    const fetchSpecialities = async () => {
        const list = await getSpecialities();
        setSpecialities(list);
    };

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const results = await searchDoctors({
                search: debouncedQuery,
                specialityId: selectedSpecialityId
            });
            setDoctors(results);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setQuery('');
        setSelectedSpecialityId(undefined);
    };

    // Handlers
    const handleProfilePress = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsProfileModalVisible(true);
    };

    const handleSpecialistBookPress = (doctor: Doctor, type: 'online' | 'physical') => {
        setSelectedDoctor(doctor);
        setAppointmentTypeFilter(type);
        setModalVisible(true);
        setSelectedDate(null);
        setSelectedTime(null);
        setBookingReason('');
        setPatientName('');
        setWhatsappNumber('');
        setPatientEmail('');
    };

    const handleBookFromProfile = () => {
        setIsProfileModalVisible(false);
        // Default to online if booked from profile generic button, or show choice?
        // For now, default to no filter or 'online'
        setAppointmentTypeFilter(null);
        setModalVisible(true);
    };

    const handleDetailView = () => {
        setIsProfileModalVisible(false);
        Alert.alert("Doctor Details", `More info about Dr. ${selectedDoctor?.name}`);
    };

    const handleScheduleAppointment = async () => {
        if (!selectedDoctor) {
            Alert.alert("Missing Info", "Please select a Doctor.");
            return;
        }
        if (!selectedDate || !selectedTime) {
            Alert.alert("Missing Info", "Please select a Date and Time.");
            return;
        }
        if (!patientName.trim() || !whatsappNumber.trim() || !patientEmail.trim()) {
            Alert.alert("Missing Info", "Please provide patient name, phone, and email.");
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const isClinic = (appointmentTypeFilter || 'online') === 'physical';

            let bookingPayload: any = {
                doctorId: selectedDoctor.doctorId,
                date: selectedDate,
                timeSlot: selectedTime,
                appointmentType: (isClinic && token) ? 'inclinic' : (appointmentTypeFilter || 'online'),
                reason: bookingReason || "General Consultation"
            };

            // Only add patient details if NOT authenticated
            if (!token) {
                bookingPayload.patientName = patientName.trim();
                bookingPayload.patientPhone = whatsappNumber.trim();
                bookingPayload.patientEmail = patientEmail.trim();
            }

            // Only add locationId if it's a clinic visit
            if (isClinic && selectedLocationId) {
                bookingPayload.locationId = selectedLocationId;
            }

            await bookAppointment(bookingPayload, token);

            setModalVisible(false);
            Alert.alert("Success", "Appointment booked successfully!", [
                { text: "OK", onPress: () => navigation.navigate('Appointment' as never) }
            ]);

            setPatientName('');
            setWhatsappNumber('');
            setPatientEmail('');
            setBookingReason('');
            setSelectedDate(null);
            setSelectedTime(null);
        } catch (error: any) {
            Alert.alert("Booking Failed", error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#1A1F3A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Find Specialist</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="search-outline" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search doctors, specialists..."
                    value={query}
                    onChangeText={setQuery}
                    placeholderTextColor="#999"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')}>
                        <Icon name="close-circle" size={18} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filters */}
            {specialities.length > 0 && (
                <View style={styles.filtersContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                !selectedSpecialityId && styles.filterChipSelected
                            ]}
                            onPress={() => setSelectedSpecialityId(undefined)}
                        >
                            <Text style={[
                                styles.filterText,
                                !selectedSpecialityId && styles.filterTextSelected
                            ]}>All Specialities</Text>
                        </TouchableOpacity>

                        {specialities.map((spec, index) => (
                            <TouchableOpacity
                                key={spec._id || index}
                                style={[
                                    styles.filterChip,
                                    selectedSpecialityId === spec._id && styles.filterChipSelected
                                ]}
                                onPress={() => setSelectedSpecialityId(spec._id)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    selectedSpecialityId === spec._id && styles.filterTextSelected
                                ]}>{spec.speciality}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Content */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#5B7FFF" />
                </View>
            ) : (
                <FlatList
                    data={doctors}
                    keyExtractor={(item) => item.doctorId}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="search" size={50} color="#EEE" />
                            <Text style={styles.emptyText}>No specialists found</Text>
                            <TouchableOpacity onPress={clearFilters}>
                                <Text style={styles.clearText}>Clear Filters</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.specialistCard}>
                            <TouchableOpacity onPress={() => handleProfilePress(item)} style={styles.doctorImageContainer}>
                                <Icon name="person-circle" size={60} color={item.color || '#5B7FFF'} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleProfilePress(item)} style={styles.cardInfo}>
                                <Text style={styles.doctorName}>{item.name}</Text>
                                <Text style={styles.specialityText}>{item.role}</Text>
                                {item.city && (
                                    <Text style={styles.locationText}>
                                        <Icon name="location-outline" size={12} /> {item.city}
                                    </Text>
                                )}
                                <View style={styles.ratingContainer}>
                                    <Icon name="star" size={14} color="#FFD700" />
                                    <Text style={styles.ratingText}>
                                        {item.rating ? item.rating.toFixed(1) : 'New'}
                                        {item.experience ? ` • ${item.experience} yrs exp` : ''}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.cardActionsColumn}>
                                <TouchableOpacity
                                    style={[styles.smallBookBtn, styles.onlineBtn]}
                                    onPress={() => handleSpecialistBookPress(item, 'online')}
                                >
                                    <Text style={styles.btnTextWhite}>Online</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.smallBookBtn, styles.clinicBtn]}
                                    onPress={() => handleSpecialistBookPress(item, 'physical')}
                                >
                                    <Text style={styles.btnTextBlue}>Clinic</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
            {/* Doctor Profile Modal */}
            <DoctorProfileModal
                visible={isProfileModalVisible}
                onClose={() => setIsProfileModalVisible(false)}
                doctor={selectedDoctor}
                onBook={handleBookFromProfile}
                onDetail={handleDetailView}
            />

            {/* Booking Modal */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        <Text style={styles.modalTitle}>Schedule Appointment</Text>

                        {/* Calendar */}
                        <Text style={styles.sectionLabel}>Select Date</Text>
                        <View style={styles.calendarWrapper}>
                            <Calendar
                                onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
                                markedDates={{
                                    [selectedDate || '']: { selected: true, selectedColor: '#5B7FFF' }
                                }}
                                minDate={new Date().toISOString().split('T')[0]}
                                theme={{
                                    selectedDayBackgroundColor: '#5B7FFF',
                                    todayTextColor: '#5B7FFF',
                                    arrowColor: '#5B7FFF',
                                }}
                            />
                        </View>

                        {/* Slots */}
                        <Text style={styles.sectionLabel}>Available Slots</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotsGrid}>
                            {selectedDoctor?.availability?.filter(slot => {
                                if (!appointmentTypeFilter) return true;
                                const slotType = slot.appointmentType ? slot.appointmentType.toLowerCase() : '';
                                const filterType = appointmentTypeFilter.toLowerCase();

                                if (filterType === 'online') {
                                    return slotType === 'online';
                                }
                                if (filterType === 'physical') {
                                    return slotType === 'in-clinic' || slotType === 'inclinic' || slotType === 'physical';
                                }
                                return true;
                            }).map((slot, index) => {
                                const isSelected = selectedTime === slot.startTime;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.slotChip, isSelected && styles.slotChipSelected]}
                                        onPress={() => {
                                            setSelectedTime(slot.startTime);
                                            setSelectedLocationId((slot as any).locationId || null);
                                        }}
                                    >
                                        <Text style={[styles.slotText, isSelected && styles.textSelected]}>
                                            {slot.startTime} - {slot.endTime} ({slot.appointmentType || 'Consultation'})
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                            {(!selectedDoctor?.availability || selectedDoctor.availability.length === 0) && (
                                <Text style={styles.slotText}>No slots available.</Text>
                            )}
                        </ScrollView>

                        {/* Patient Information */}
                        <Text style={styles.sectionLabel}>Patient Information</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.fieldLabel}>Full Name</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter patient's full name"
                                value={patientName}
                                onChangeText={setPatientName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.fieldLabel}>Phone Number / WhatsApp</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter phone number"
                                keyboardType="phone-pad"
                                value={whatsappNumber}
                                onChangeText={setWhatsappNumber}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.fieldLabel}>Email Address</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter email address"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={patientEmail}
                                onChangeText={setPatientEmail}
                            />
                        </View>
                        <View style={{ marginTop: 16 }}>
                            <Text style={styles.fieldLabel}>Reason</Text>
                            <TextInput
                                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="Reason..."
                                multiline
                                value={bookingReason}
                                onChangeText={setBookingReason}
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleScheduleAppointment}
                                disabled={loading}
                            >
                                {loading && selectedDate ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.confirmButtonText}>Book</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 20 }} />
                    </ScrollView>
                </View>
            </Modal>
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
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1F3A' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F6F8',
        marginHorizontal: 16,
        marginTop: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        height: 44,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },
    filtersContainer: {
        marginTop: 16,
        paddingLeft: 16,
        paddingBottom: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F6F8',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    filterChipSelected: {
        backgroundColor: '#5B7FFF',
        borderColor: '#5B7FFF',
    },
    filterText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    filterTextSelected: {
        color: '#FFF',
    },
    listContainer: { padding: 16, gap: 16 },
    specialistCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    doctorImageContainer: { marginRight: 16 },
    cardInfo: { flex: 1 },
    doctorName: { fontSize: 16, fontWeight: '700', color: '#1A1F3A', marginBottom: 4 },
    specialityText: { fontSize: 14, color: '#5B7FFF', fontWeight: '600', marginBottom: 4 },
    locationText: { fontSize: 12, color: '#999', marginBottom: 6 },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    ratingText: { fontSize: 12, color: '#666', fontWeight: '600' },
    bookButton: {
        backgroundColor: '#5B7FFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    bookButtonText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { marginTop: 16, fontSize: 16, color: '#999', fontWeight: '500' },
    clearText: { marginTop: 8, color: '#5B7FFF', fontWeight: '600' },

    // New Styles for Actions & Modal
    cardActionsColumn: {
        gap: 8,
        minWidth: 80,
    },
    smallBookBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    onlineBtn: {
        backgroundColor: '#5B7FFF',
    },
    clinicBtn: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#5B7FFF',
    },
    btnTextWhite: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    btnTextBlue: {
        color: '#5B7FFF',
        fontSize: 11,
        fontWeight: '700',
    },

    // Modal Styles (simplified copy from Home)
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '85%',
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1F3A',
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1F3A',
        marginTop: 16,
        marginBottom: 12,
    },
    calendarWrapper: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        overflow: 'hidden',
    },
    slotsGrid: {
        flexDirection: 'row',
        gap: 10,
    },
    slotChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFF',
        marginRight: 8,
    },
    slotChipSelected: {
        backgroundColor: '#5B7FFF',
        borderColor: '#5B7FFF',
    },
    slotText: {
        fontSize: 12,
        color: '#333',
    },
    textSelected: {
        color: '#FFF',
    },
    fieldLabel: {
        fontSize: 12,
        marginBottom: 6,
        color: '#333',
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 12,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#F9F9F9',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: { backgroundColor: '#F0F0F0' },
    confirmButton: { backgroundColor: '#5B7FFF' },
    cancelButtonText: { color: '#666', fontWeight: '600' },
    confirmButtonText: { color: '#FFF', fontWeight: '600' },
});

export default AllSpecialistsScreen;
