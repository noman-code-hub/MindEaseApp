import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createResponsiveStyles } from '../utils/responsive';

const { width } = Dimensions.get('window');

interface DoctorStats {
    todayAppointments: number;
    totalPatients: number;
    pendingAppointments: number;
    completedAppointments: number;
}

interface TodayAppointment {
    _id: string;
    patientName: string;
    patientPhone: string;
    appointmentTime?: string;
    time?: string;
    timeSlot?: string;
    appointmentType: 'online' | 'in-clinic';
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

// Animated Stat Card Component
const StatCard = ({ title, value, icon, color, index }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View
            style={[
                styles.statCard,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
            ]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.statCardInner}
            >
                <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
                    <Icon name={icon} size={24} color={color} />
                </View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const DoctorDashboardScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [doctorName, setDoctorName] = useState('Doctor');
    const [doctorStatus, setDoctorStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<DoctorStats>({
        todayAppointments: 0,
        totalPatients: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
    });
    const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);

    const headerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(headerAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const fetchDashboardData = async (isRefreshing = false) => {
        try {
            if (!isRefreshing) setLoading(true);

            const doctorId = await AsyncStorage.getItem('doctorId');
            const token = await AsyncStorage.getItem('token');
            const storedName = await AsyncStorage.getItem('doctorName') || 'Doctor';
            const storedStatus = await AsyncStorage.getItem('doctorStatus');

            setDoctorName(storedName);
            setDoctorStatus(storedStatus);

            if (!doctorId || !token) {
                console.log('[DASHBOARD] Missing doctorId or token');
                return;
            }

            // Fetch appointments
            const response = await fetch(
                `https://appbookingbackend.onrender.com/api/appointments/doctor/${doctorId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                const appointments = data.data || data.appointments || [];

                // Calculate stats
                const today = new Date().toISOString().split('T')[0];
                const todayAppts = appointments.filter((apt: any) => {
                    const aptDate = apt.appointmentDate || apt.date || '';
                    return aptDate.startsWith(today);
                });

                const pending = appointments.filter((apt: any) => apt.status === 'pending').length;
                const completed = appointments.filter((apt: any) => apt.status === 'completed').length;

                // Get unique patients
                const uniquePatients = new Set(appointments.map((apt: any) => apt.patientPhone));

                setStats({
                    todayAppointments: todayAppts.length,
                    totalPatients: uniquePatients.size,
                    pendingAppointments: pending,
                    completedAppointments: completed,
                });

                setTodayAppointments(todayAppts.slice(0, 5)); // Show first 5
            }
        } catch (error) {
            console.error('[DASHBOARD] Error fetching data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchDashboardData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData(true);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const renderAppointmentItem = (item: TodayAppointment, index: number) => {
        const getStatusColor = (status: string) => {
            switch (status) {
                case 'confirmed': return '#10B981';
                case 'pending': return '#F59E0B';
                case 'completed': return '#6366F1';
                case 'cancelled': return '#EF4444';
                default: return '#6B7280';
            }
        };

        return (
            <TouchableOpacity
                key={item._id}
                style={styles.appointmentItem}
                onPress={() => navigation.navigate('Appointment')}
            >
                <View style={styles.appointmentLeft}>
                    <View style={styles.appointmentAvatar}>
                        <Icon name="person" size={20} color="#5B7FFF" />
                    </View>
                    <View style={styles.appointmentInfo}>
                        <Text style={styles.appointmentPatient}>{item.patientName}</Text>
                        <Text style={styles.appointmentTime}>
                            <Icon name="time-outline" size={12} color="#6B7280" />
                            {' '}{item.appointmentTime || item.time || item.timeSlot || 'Time not set'}
                        </Text>
                    </View>
                </View>
                <View style={styles.appointmentRight}>
                    <View style={[styles.appointmentTypeBadge, {
                        backgroundColor: item.appointmentType === 'online' ? '#EEF2FF' : '#FEF3C7'
                    }]}>
                        <Icon
                            name={item.appointmentType === 'online' ? 'videocam' : 'location'}
                            size={12}
                            color={item.appointmentType === 'online' ? '#5B7FFF' : '#F59E0B'}
                        />
                    </View>
                    <View style={[styles.appointmentStatusDot, { backgroundColor: getStatusColor(item.status) }]} />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5B7FFF" />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Premium Header */}
            <Animated.View style={[styles.header, { opacity: headerAnim }]}>
                <View style={styles.headerGradient}>
                    <View style={styles.headerContent}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.greeting}>{getGreeting()},</Text>
                            <View style={styles.nameContainer}>
                                <Text style={styles.doctorName} numberOfLines={1}>{doctorName}</Text>
                                {doctorStatus === 'ACTIVE' && (
                                    <Icon name="checkmark-circle" size={24} color="#FFFFFF" style={styles.verifiedTick} />
                                )}
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.notificationButton}
                            onPress={() => navigation.navigate('Appointment')}
                        >
                            <Icon name="notifications" size={24} color="#FFFFFF" />
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationBadgeText}>{stats.pendingAppointments}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#5B7FFF']}
                        tintColor="#5B7FFF"
                    />
                }
            >
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Today's Appointments"
                        value={stats.todayAppointments}
                        icon="calendar"
                        color="#5B7FFF"
                        index={0}
                    />
                    <StatCard
                        title="Total Patients"
                        value={stats.totalPatients}
                        icon="people"
                        color="#10B981"
                        index={1}
                    />
                    <StatCard
                        title="Pending"
                        value={stats.pendingAppointments}
                        icon="time"
                        color="#F59E0B"
                        index={2}
                    />
                    <StatCard
                        title="Completed"
                        value={stats.completedAppointments}
                        icon="checkmark-circle"
                        color="#6366F1"
                        index={3}
                    />
                </View>

                {/* Today's Schedule */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Today's Schedule</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Appointment')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {todayAppointments.length > 0 ? (
                        <View style={styles.appointmentsList}>
                            {todayAppointments.map((item, index) => renderAppointmentItem(item, index))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Icon name="calendar-outline" size={48} color="#D1D5DB" />
                            <Text style={styles.emptyStateText}>No appointments scheduled for today</Text>
                        </View>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('Appointment')}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#EEF2FF' }]}>
                                <Icon name="calendar" size={24} color="#5B7FFF" />
                            </View>
                            <Text style={styles.quickActionText}>All Appointments</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('DoctorProfileSetup')}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#F0FDF4' }]}>
                                <Icon name="time" size={24} color="#10B981" />
                            </View>
                            <Text style={styles.quickActionText}>Manage Availability</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('Billing')}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
                                <Icon name="receipt" size={24} color="#F59E0B" />
                            </View>
                            <Text style={styles.quickActionText}>View Billing</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionCard}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#F5F3FF' }]}>
                                <Icon name="person" size={24} color="#7C3AED" />
                            </View>
                            <Text style={styles.quickActionText}>My Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
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
    header: {
        marginBottom: 20,
    },
    headerGradient: {
        backgroundColor: '#5B7FFF',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingHorizontal: 20,
        paddingVertical: 24,
        elevation: 8,
        shadowColor: '#5B7FFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 16,
        color: '#E0E7FF',
        fontWeight: '500',
        marginBottom: 4,
    },
    doctorName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    verifiedTick: {
        marginTop: 4,
    },
    notificationButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        width: (width - 52) / 2,
        marginBottom: 12,
    },
    statCardInner: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    seeAllText: {
        fontSize: 14,
        color: '#5B7FFF',
        fontWeight: '600',
    },
    appointmentsList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    appointmentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    appointmentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    appointmentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    appointmentInfo: {
        flex: 1,
    },
    appointmentPatient: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    appointmentTime: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    appointmentRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    appointmentTypeBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appointmentStatusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    emptyState: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    emptyStateText: {
        marginTop: 12,
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quickActionCard: {
        width: (width - 52) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    quickActionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
        textAlign: 'center',
    },
});

export default DoctorDashboardScreen;
