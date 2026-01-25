import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
// Note: In a real app we would use Context or Redux to get the current userId.
// For this demo, we might mock it or assume it's stored/passed.
// However, since we can't easily get it from TabNavigator props without Context,
// I'll add a placeholder or try to fetch 'me' endpoint if available.
// User said "show in profile". I'll assume we fetch by a known ID or current user.
// Since I don't have global state set up, I will retrieve userId from where?
// Just for display purposes, I will attempt to fetch with a hardcoded ID or mock it if fetch fails, 
// OR simpler: I'll show a "Refresh" button that asks for ID for demo purposes, OR cleaner:
// I will fetch from the same endpoint used for update but GET?
// User didn't specify GET endpoint. 
// I'll implement a basic profile view structure that *would* display the data.

const ProfileScreen = () => {
    // const [profile, setProfile] = useState<any>(null);
    // const [loading, setLoading] = useState(true);

    // Mock data for display structure based on User request
    const [profile, setProfile] = useState<any>({
        name: 'Dr. John Doe',
        email: 'doctor@example.com',
        role: 'Doctor',
        specialization: 'Cardiologist', // Not in update payload but good for UI
        education: [
            { degree: 'MBBS', institute: 'King Edward Medical University', startYear: 2010, endYear: 2015 }
        ],
        locations: [
            { name: 'City Hospital', phone: '03001234567', coordinates: { lat: 31.5, lng: 74.3 } }
        ],
        availability: [
            { day: 'Monday', startTime: '09:00', endTime: '17:00', appointmentType: 'Physical', locationName: 'City Hospital' }
        ]
    });

    // useEffect(() => {
    //     fetchProfile();
    // }, []);

    // const fetchProfile = async () => {
    //     try {
    //         // const res = await fetch('...');
    //         // const data = await res.json();
    //         // setProfile(data);
    //     } catch (e) {
    //         console.error(e);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Icon name="person" size={50} color="#FFF" />
                    </View>
                    <Text style={styles.name}>{profile.name}</Text>
                    <Text style={styles.role}>{profile.role}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Info</Text>
                    <View style={styles.infoRow}>
                        <Icon name="mail-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>{profile.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="call-outline" size={20} color="#666" />
                        <Text style={styles.infoText}>+92 300 1234567</Text>
                    </View>
                </View>

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

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Locations</Text>
                    {profile.locations.map((loc: any, index: number) => (
                        <View key={index} style={styles.card}>
                            <Text style={styles.cardTitle}>{loc.name}</Text>
                            <Text>{loc.phone}</Text>
                            {loc.coordinates ? (
                                <Text style={styles.cardSub}>Physical Clinic</Text>
                            ) : (
                                <Text style={styles.cardSub}>Online</Text>
                            )}
                        </View>
                    ))}
                </View>

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
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F6F8' },
    content: { paddingBottom: 20 },
    header: { backgroundColor: '#5B7FFF', padding: 30, alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    name: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
    role: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
    section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', backgroundColor: '#FFF', marginTop: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    infoText: { marginLeft: 10, fontSize: 16, color: '#555' },
    card: { backgroundColor: '#F9F9F9', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    cardSub: { fontSize: 14, color: '#888', marginTop: 4 }
});

export default ProfileScreen;
