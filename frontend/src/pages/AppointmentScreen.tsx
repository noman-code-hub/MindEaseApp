import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createResponsiveStyles } from '../utils/responsive';

interface Appointment {
    _id: string;
    patientName: string;
    patientPhone: string;
    doctorName?: string; // For patients (legacy)
    doctorPhone?: string; // For patients
    doctorId?: {
        _id: string;
        name: string;
        role?: string;
    }; // Modern nested object
    appointmentDate?: string;
    date?: string;
    appointmentTime?: string;
    time?: string;
    timeSlot?: string;
    appointmentType: 'online' | 'in-clinic';
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    createdAt: string;
}

const AppointmentScreen = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    const fetchAppointments = async (isRefreshing = false) => {
        try {
            if (!isRefreshing) setLoading(true);
            setError(null);

            const token = await AsyncStorage.getItem('token');
            const role = await AsyncStorage.getItem('role');
            const doctorId = await AsyncStorage.getItem('doctorId');

            setUserRole(role);

            if (!token) {
                setError('Login token not found. Please log in again.');
                return;
            }

            let url = '';
            if (role?.toLowerCase() === 'doctor') {
                if (!doctorId) {
                    setError('Doctor ID not found. Please log in again.');
                    return;
                }
                url = `https://appbookingbackend.onrender.com/api/appointments/doctor/${doctorId}`;
                console.log('[APPOINTMENTS] Fetching for doctorId:', doctorId);
            } else {
                url = 'https://appbookingbackend.onrender.com/api/appointments/my';
                console.log('[APPOINTMENTS] Fetching for patient');
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const text = await response.text();
            console.log('[APPOINTMENTS] Raw API Response:', text);

            let data;
            try {
                data = JSON.parse(text);
                console.log('[APPOINTMENTS] Parsed API Response:', data);
            } catch (e) {
                console.error('[APPOINTMENTS] Failed to parse JSON:', e);
                setError('Server returned an invalid response. Check logs.');
                return;
            }

            if (response.ok) {
                const appointmentsList = data.data || data.appointments || data || [];
                setAppointments(Array.isArray(appointmentsList) ? appointmentsList : []);
            } else {
                setError(data.message || 'Failed to fetch appointments');
            }
        } catch (err) {
            console.error('[APPOINTMENTS] Error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAppointments(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return '#10B981';
            case 'pending':
                return '#F59E0B';
            case 'completed':
                return '#6366F1';
            case 'cancelled':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'checkmark-circle';
            case 'pending':
                return 'time';
            case 'completed':
                return 'checkmark-done-circle';
            case 'cancelled':
                return 'close-circle';
            default:
                return 'help-circle';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Date not set';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Fallback if invalid
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleVideoCall = () => {
        Alert.alert('Video Call', 'Starting video consultation...');
    };

    const renderAppointment = ({ item }: { item: Appointment }) => {
        const isDoctor = userRole?.toLowerCase() === 'doctor';

        return (
            <View style={styles.appointmentCard}>
                <View style={styles.cardHeader}>
                    <View style={styles.patientInfo}>
                        <View style={styles.avatarCircle}>
                            <Icon name={isDoctor ? 'person' : 'medical'} size={20} color="#5B7FFF" />
                        </View>
                        <View style={styles.patientDetails}>
                            <Text style={styles.patientName}>
                                {isDoctor ? item.patientName : (item.doctorId?.name || item.doctorName || 'Doctor')}
                            </Text>
                            <Text style={styles.patientPhone}>
                                {isDoctor ? item.patientPhone : (item.doctorPhone || 'Professional Help')}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                        <Icon name={getStatusIcon(item.status)} size={14} color={getStatusColor(item.status)} />
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Icon name="calendar-outline" size={16} color="#6B7280" />
                        <Text style={styles.infoText}>{formatDate(item.appointmentDate || item.date || '')}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="time-outline" size={16} color="#6B7280" />
                        <Text style={styles.infoText}>{item.appointmentTime || item.time || item.timeSlot || 'Time not set'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon
                            name={item.appointmentType === 'online' ? 'videocam-outline' : 'location-outline'}
                            size={16}
                            color="#6B7280"
                        />
                        <Text style={styles.infoText}>
                            {item.appointmentType === 'online' ? 'Online Consultation' : 'In-Clinic Visit'}
                        </Text>
                    </View>
                </View>

                {item.appointmentType === 'online' && (
                    <View style={styles.cardFooter}>
                        <TouchableOpacity style={styles.videoCallButton} onPress={handleVideoCall}>
                            <Icon name="videocam" size={18} color="#FFFFFF" />
                            <Text style={styles.videoCallText}>Start Video Call</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Icon name="calendar-outline" size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>No Appointments Yet</Text>
            <Text style={styles.emptySubtitle}>
                {userRole?.toLowerCase() === 'doctor'
                    ? 'Your appointments will appear here once patients book with you.'
                    : 'You have not booked any appointments yet. Head to Home to find a specialist.'}
            </Text>
        </View>
    );

    const renderError = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Icon name="alert-circle-outline" size={64} color="#EF4444" />
            </View>
            <Text style={styles.emptyTitle}>Error Loading Appointments</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchAppointments()}>
                <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5B7FFF" />
                <Text style={styles.loadingText}>Loading appointments...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {error && !loading ? (
                renderError()
            ) : (
                <FlatList
                    data={appointments}
                    renderItem={renderAppointment}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={[
                        styles.listContainer,
                        appointments.length === 0 && styles.emptyListContainer,
                    ]}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#5B7FFF']}
                            tintColor="#5B7FFF"
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = createResponsiveStyles({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500',
    },
    listContainer: {
        padding: 16,
    },
    emptyListContainer: {
        flexGrow: 1,
    },
    appointmentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    patientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    patientDetails: {
        flex: 1,
    },
    patientName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 0,
    },
    patientPhone: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    cardBody: {
        gap: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#5B7FFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    cardFooter: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 8,
    },
    videoCallButton: {
        backgroundColor: '#5B7FFF',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
    },
    videoCallText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
    },
});

export default AppointmentScreen;
