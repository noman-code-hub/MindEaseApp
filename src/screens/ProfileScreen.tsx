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


            // Try the new endpoint first: /api/doctor (without /profile)
            console.log('Fetching from: https://appbookingbackend.onrender.com/api/doctor');
            console.log('Using userId:', userId);
            console.log('Using token:', token.substring(0, 20) + '...');

            const response = await fetch(`https://appbookingbackend.onrender.com/api/doctor`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

            // Get response text first
            const responseText = await response.text();
            console.log('Raw response:', responseText);

            // Check if response is JSON
            let data;
            try {
                data = JSON.parse(responseText);
                console.log('Parsed JSON response:', JSON.stringify(data, null, 2));
            } catch (parseError) {
                console.error('Failed to parse JSON. Response was:', responseText.substring(0, 1000));

                // If the endpoint doesn't exist or returns HTML, try alternative endpoint
                console.log('Trying alternative endpoint with userId...');
                try {
                    const altResponse = await fetch(`https://appbookingbackend.onrender.com/api/doctor/profile/${userId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const altText = await altResponse.text();
                    console.log('Alternative endpoint response:', altText);

                    if (altResponse.status === 200 || altResponse.status === 201) {
                        const altData = JSON.parse(altText);
                        const profileData = altData.data || altData.doctor || altData;
                        console.log('Profile data from alternative endpoint:', profileData);
                        setProfile(profileData);
                        setLoading(false);
                        setRefreshing(false);
                        return;
                    }
                } catch (altError) {
                    console.error('Alternative endpoint also failed:', altError);
                }

                setError('Server returned an invalid response. Please contact support.');
                setLoading(false);
                setRefreshing(false);
                return;
            }

            if (response.status === 200 || response.status === 201) {
                // Extract profile data from response - try multiple possible structures
                let profileData = data.data || data.doctor || data;

                // Handle array response
                if (Array.isArray(profileData) && profileData.length > 0) {
                    profileData = profileData[0];
                }

                console.log('Extracted profile data (FIXED):', JSON.stringify(profileData, null, 2));

                if (!profileData || (!profileData.name && !profileData.email)) {
                    console.warn('Profile data exists but is empty or incomplete:', profileData);
                    setError('Profile data is incomplete. Please complete your profile setup.');
                } else {
                    console.log('Setting profile with data:', profileData);
                    setProfile(profileData);
                }
            } else if (response.status === 404) {
                setError('Profile not found. Please complete your profile setup.');
            } else {
                setError(data.message || `Failed to load profile (Status: ${response.status})`);
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
                                routes: [{ name: 'Welcome' }]
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
    logoutButtonBottomText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#FF6B6B' }
});

export default ProfileScreen;
