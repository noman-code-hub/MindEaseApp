import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
    Alert,
    TouchableOpacity,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setError(null);

            // Get userId and token from AsyncStorage
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');
            const role = await AsyncStorage.getItem('role');

            console.log('ProfileScreen - Retrieved from AsyncStorage:', { userId, token: token ? 'exists' : 'missing', role });

            if (!userId || !token) {
                setError('Not logged in. Please login again.');
                setLoading(false);
                return;
            }

            // Check if role is doctor
            if (role && role.toLowerCase() !== 'doctor') {
                setError('This profile screen is for doctors only.');
                setLoading(false);
                return;
            }


            // Multi-layered fetching strategy for robustness
            const doctorId = await AsyncStorage.getItem('doctorId');
            let profileData = null;

            // 1. Try fetching by doctorId if we have it
            if (doctorId) {
                try {
                    console.log(`Trying fetch by doctorId: ${doctorId}`);
                    const response = await fetch(`https://appbookingbackend.onrender.com/api/doctor/${doctorId}`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        profileData = data.data || data.doctor || data;
                        console.log('Found profile via doctorId');
                    }
                } catch (e) {
                    console.warn('Fetch by doctorId failed, trying next...');
                }
            }

            // 2. Fallback to userId profile endpoint
            if (!profileData) {
                try {
                    console.log(`Trying fetch by userId profile endpoint: ${userId}`);
                    const response = await fetch(`https://appbookingbackend.onrender.com/api/doctor/profile/${userId}`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        profileData = data.data || data.doctor || data;
                        console.log('Found profile via userId profile endpoint');
                    }
                } catch (e) {
                    console.warn('Fetch by userId profile failed, trying next...');
                }
            }

            // 3. Last resort: Fetch ALL doctors and filter by normalized whatsappnumber or userId
            if (!profileData) {
                try {
                    console.log('Fallback: Filtering all doctors by normalized phone or userId');
                    const storedWhatsapp = await AsyncStorage.getItem('whatsappnumber');

                    const normalizePhone = (phone: string | undefined): string => {
                        if (!phone) return '';
                        let clean = phone.replace(/\D/g, '');
                        if (clean.startsWith('92')) clean = clean.substring(2);
                        if (clean.startsWith('0')) clean = clean.substring(1);
                        return clean;
                    };

                    const normalizedTarget = normalizePhone(storedWhatsapp || '');

                    const response = await fetch('https://appbookingbackend.onrender.com/api/doctor', {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        const allDoctors = data.data?.doctors || data.data || data;
                        if (Array.isArray(allDoctors)) {
                            profileData = allDoctors.find((d: any) => {
                                const normalizedDPhone = normalizePhone(d.whatsappnumber);
                                const matchesPhone = normalizedDPhone === normalizedTarget && normalizedTarget !== '';
                                const matchesUserId = (d.userId && d.userId === userId) ||
                                    (d.user && (d.user?._id === userId || d.user === userId));
                                return matchesPhone || matchesUserId;
                            });
                            if (profileData) {
                                console.log('Found profile via robust manual filtering');
                            }
                        }
                    }
                } catch (e) {
                    console.error('Final fallback failed:', e);
                }
            }

            if (profileData) {
                // Store doctorId for next time if we found it
                const foundId = profileData._id || profileData.id;
                if (foundId) {
                    await AsyncStorage.setItem('doctorId', foundId);
                }
                setProfile(profileData);
            } else {
                setError('Profile not found. Please complete your profile setup.');
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchProfile();
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Main' }]
                            });
                        } catch (err) {
                            console.error('Logout error:', err);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#5B7FFF" />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !profile) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <Icon name="alert-circle-outline" size={60} color="#FF6B6B" />
                    <Text style={styles.errorText}>{error || 'Profile not found'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Icon name="person" size={50} color="#FFF" />
                    </View>
                    <Text style={styles.name}>{profile.name || 'Doctor'}</Text>
                    <Text style={styles.role}>Doctor</Text>
                    {profile.specialization && (
                        <Text style={styles.specialization}>{profile.specialization}</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Info</Text>
                    <View style={styles.infoRow}>
                        <Icon name="mail-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>{profile.email || 'N/A'}</Text>
                    </View>
                    {profile.emergencyContact && (
                        <View style={styles.infoRow}>
                            <Icon name="call-outline" size={20} color="#666" />
                            <Text style={styles.infoText}>{profile.emergencyContact}</Text>
                        </View>
                    )}
                    {profile.address && (
                        <View style={styles.infoRow}>
                            <Icon name="location-outline" size={20} color="#666" />
                            <Text style={styles.infoText}>
                                {profile.address.street ? `${profile.address.street}, ` : ''}
                                {profile.address.city || 'N/A'}
                            </Text>
                        </View>
                    )}
                </View>

                {profile.about ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.infoText}>{profile.about}</Text>
                    </View>
                ) : null}

                {(profile.gender || (profile.languages && profile.languages.length > 0)) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Additional Info</Text>
                        {profile.gender ? (
                            <View style={styles.infoRow}>
                                <Icon name="person-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>Gender: {profile.gender}</Text>
                            </View>
                        ) : null}
                        {profile.languages && profile.languages.length > 0 && (
                            <View style={styles.infoRow}>
                                <Icon name="language-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>Languages: {profile.languages.join(', ')}</Text>
                            </View>
                        )}
                        {profile.superSpeciality ? (
                            <View style={styles.infoRow}>
                                <Icon name="medkit-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>Super Speciality: {profile.superSpeciality}</Text>
                            </View>
                        ) : null}
                    </View>
                )}

                {profile.pmdcRegistrationNumber && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional Info</Text>
                        <View style={styles.infoRow}>
                            <Icon name="medical-outline" size={20} color="#666" />
                            <Text style={styles.infoText}>PMDC: {profile.pmdcRegistrationNumber}</Text>
                        </View>
                        {profile.experience && (
                            <View style={styles.infoRow}>
                                <Icon name="time-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>Experience: {profile.experience} years</Text>
                            </View>
                        )}
                    </View>
                )}

                {profile.education && profile.education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {profile.education.map((edu: any, index: number) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardTitle}>{edu.degree}</Text>
                                <Text>{edu.institute}</Text>
                                <Text style={styles.cardSub}>{edu.startYear} - {edu.endYear}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {(profile.awards && profile.awards.length > 0) || (profile.memberships && profile.memberships.length > 0) ? (
                    <View style={styles.section}>
                        {profile.awards && profile.awards.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Awards</Text>
                                {profile.awards.map((awr: any, index: number) => (
                                    <View key={index} style={styles.card}>
                                        <Text style={styles.cardTitle}>{awr.name}</Text>
                                        <Text style={styles.cardSub}>{awr.year}</Text>
                                    </View>
                                ))}
                            </>
                        )}
                        {profile.memberships && profile.memberships.length > 0 && (
                            <>
                                <Text style={[styles.sectionTitle, { marginTop: profile.awards && profile.awards.length > 0 ? 15 : 0 }]}>Memberships</Text>
                                {profile.memberships.map((mem: string, index: number) => (
                                    <View key={index} style={styles.card}>
                                        <Text style={styles.cardTitle}>{mem}</Text>
                                    </View>
                                ))}
                            </>
                        )}
                    </View>
                ) : null}

                {profile.fees && (profile.fees.online || profile.fees.inclinic) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Consultation Fees</Text>
                        <View style={styles.feeContainer}>
                            {profile.fees.online ? (
                                <View style={styles.feeCard}>
                                    <Text style={styles.feeLabel}>Online</Text>
                                    <Text style={styles.feeAmount}>Rs. {profile.fees.online}</Text>
                                </View>
                            ) : null}
                            {profile.fees.inclinic ? (
                                <View style={styles.feeCard}>
                                    <Text style={styles.feeLabel}>In-Clinic</Text>
                                    <Text style={styles.feeAmount}>Rs. {profile.fees.inclinic}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>
                )}

                {profile.locations && profile.locations.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Locations</Text>
                        {profile.locations.map((loc: any, index: number) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardTitle}>{loc.name}</Text>
                                {loc.phone && <Text>{loc.phone}</Text>}
                                {loc.coordinates && (loc.coordinates.lat !== 0 || loc.coordinates.lng !== 0) ? (
                                    <Text style={styles.cardSub}>Physical Clinic</Text>
                                ) : (
                                    <Text style={styles.cardSub}>Online Consultation</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {profile.availability && profile.availability.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Availability</Text>
                        {profile.availability.map((avail: any, index: number) => (
                            <View key={index} style={styles.card}>
                                <Text style={styles.cardTitle}>{avail.day}</Text>
                                <Text>{avail.startTime} - {avail.endTime}</Text>
                                <Text style={styles.cardSub}>{avail.appointmentType} @ {avail.locationName}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity style={styles.logoutButtonBottom} onPress={handleLogout}>
                    <Icon name="log-out-outline" size={20} color="#FF6B6B" />
                    <Text style={styles.logoutButtonBottomText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F6F8' },
    content: { paddingBottom: 20 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
    errorText: { marginTop: 10, fontSize: 16, color: '#FF6B6B', textAlign: 'center' },
    retryButton: { marginTop: 20, backgroundColor: '#5B7FFF', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8 },
    retryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    logoutButton: { marginTop: 10, paddingHorizontal: 30, paddingVertical: 12 },
    logoutButtonText: { color: '#FF6B6B', fontSize: 16, fontWeight: '600' },
    header: { backgroundColor: '#5B7FFF', padding: 30, alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    name: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
    role: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
    specialization: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
    section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#FFF', marginTop: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    infoText: { marginLeft: 10, fontSize: 16, color: '#555' },
    card: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    cardSub: { fontSize: 14, color: '#888', marginTop: 4 },
    logoutButtonBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginHorizontal: 20, marginTop: 20, borderWidth: 1, borderColor: '#FF6B6B' },
    logoutButtonBottomText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#FF6B6B' },
    feeContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    feeCard: { flex: 1, backgroundColor: '#FAFAFA', padding: 12, borderRadius: 8, marginHorizontal: 4, alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
    feeLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
    feeAmount: { fontSize: 16, fontWeight: 'bold', color: '#5B7FFF' }
});

export default ProfileScreen;
