import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Switch, // Added comma to fix syntax error
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

const STEPS = ['Personal Info', 'Education', 'Locations', 'Availability'];

const DoctorProfileSetupScreen = () => {
    const navigation = useNavigation<any>();
    const [currentStep, setCurrentStep] = useState(0);

    // Form State
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        emergencyContact: '',
        address: { street: '', city: '' },
        pmdcRegistrationNumber: '',
        experience: '',
        locations: [] as any[],
        education: [] as any[],
        availability: [] as any[]
    });

    // Temporary states for adding items
    const [tempEducation, setTempEducation] = useState({ degree: '', institute: '', startYear: '', endYear: '' });
    const [tempLocation, setTempLocation] = useState({ name: '', phone: '', lat: '', lng: '', isOnline: false });
    const [tempAvailability, setTempAvailability] = useState({ day: 'Monday', startTime: '', endTime: '', appointmentType: 'inclinic', locationName: '' });

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            navigation.goBack();
        }
    };

    const [loading, setLoading] = useState(false);

    // Get userId and token from navigation params
    const route = useRoute();
    const { userId, token } = (route.params as { userId: string; token: string }) || {};

    React.useEffect(() => {
        console.log('DoctorProfileSetup - Received userId:', userId);
        console.log('DoctorProfileSetup - Received token:', token);

        if (!userId) {
            Alert.alert(
                'Session Error',
                'User Identification missing. Please login again.',
                [{ text: 'Go to Login', onPress: () => navigation.navigate('Login') }]
            );
        } else {
            // Fetch existing profile data
            fetchDoctorProfile();
        }
    }, [userId, token]);

    const fetchDoctorProfile = async () => {
        if (!userId) return;

        try {
            console.log('Fetching doctor profile for userId:', userId);

            const response = await fetch(`https://appbookingbackend.onrender.com/api/doctor`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            console.log('Response status:', response.status);

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response received:', text.substring(0, 500));
                console.log('No existing profile found or server error, starting fresh');
                return;
            }

            const data = await response.json();
            console.log('Doctor profile fetch response:', JSON.stringify(data, null, 2));

            if (response.status === 200 || response.status === 201) {
                // Extract profile data from response
                let doctorData = data.data || data.doctor || data;

                // Handle array response
                if (Array.isArray(doctorData) && doctorData.length > 0) {
                    doctorData = doctorData[0];
                }

                // Pre-populate form with existing data
                if (doctorData) {
                    setProfileData({
                        name: doctorData.name || '',
                        email: doctorData.email || '',
                        emergencyContact: doctorData.emergencyContact || '',
                        address: doctorData.address || { street: '', city: '' },
                        pmdcRegistrationNumber: doctorData.pmdcRegistrationNumber || '',
                        experience: doctorData.experience ? String(doctorData.experience) : '',
                        locations: doctorData.locations || [],
                        education: doctorData.education || [],
                        availability: doctorData.availability || []
                    });
                    console.log('Profile data pre-populated successfully');
                }
            } else {
                console.log('No existing profile found, starting fresh');
            }
        } catch (error) {
            console.error('Error fetching doctor profile:', error);
            // Don't show error alert - just let them fill the form from scratch
        }
    };

    const handleSubmit = async () => {
        // Validate minimal requirement
        if (!profileData.name || !profileData.email) {
            Alert.alert('Error', 'Please fill in personal information');
            return;
        }

        if (!userId) {
            Alert.alert('Error', 'User ID is missing. Please login again.');
            return;
        }

        setLoading(true);
        try {
            // Sanitize locations to ensure all have coordinates
            const sanitizedLocations = profileData.locations.map(loc => {
                // If location doesn't have coordinates, add default ones
                if (!loc.coordinates || typeof loc.coordinates.lat === 'undefined' || typeof loc.coordinates.lng === 'undefined') {
                    return {
                        ...loc,
                        coordinates: { lat: 0, lng: 0 }
                    };
                }
                return loc;
            });

            const payload = {
                userId: userId,
                ...profileData,
                locations: sanitizedLocations, // Use sanitized locations
                // Ensure numbers are numbers if required by backend, user schema suggests strict types usually
                experience: parseInt(profileData.experience) || 0,
            };

            console.log('=== DEBUG: Locations Array ===');
            console.log('Number of locations:', sanitizedLocations.length);
            sanitizedLocations.forEach((loc, idx) => {
                console.log(`Location ${idx}:`, JSON.stringify(loc, null, 2));
            });
            console.log('=== END DEBUG ===');

            console.log('Sending profile update with payload:', JSON.stringify(payload, null, 2));
            console.log('Using token:', token);

            const response = await fetch('https://appbookingbackend.onrender.com/api/doctor/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log('Profile update response:', JSON.stringify(data, null, 2));

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Success', 'Profile updated successfully!', [
                    {
                        text: 'OK',
                        onPress: () => navigation.reset({
                            index: 0,
                            routes: [{ name: 'Main' }],
                        })
                    }
                ]);
            } else {
                Alert.alert('Error', data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            Alert.alert('Error', 'Network error or server unreachable');
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = (key: string, value: any) => {
        setProfileData(prev => ({ ...prev, [key]: value }));
    };

    // --- Render Steps ---

    const renderProgressBar = () => {
        return (
            <View style={styles.progressContainer}>
                {STEPS.map((step, index) => (
                    <View key={index} style={styles.stepWrapper}>
                        <View style={[styles.stepCircle, index <= currentStep && styles.stepCircleActive]}>
                            {index < currentStep ? (
                                <Icon name="checkmark" size={16} color="#FFF" />
                            ) : (
                                <Text style={[styles.stepNumber, index <= currentStep && styles.stepNumberActive]}>{index + 1}</Text>
                            )}
                        </View>
                        {index < STEPS.length - 1 && (
                            <View style={[styles.stepLine, index < currentStep && styles.stepLineActive]} />
                        )}
                    </View>
                ))}
            </View>
        );
    };

    const renderPersonalInfo = () => (
        <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={profileData.name}
                onChangeText={(t) => updateProfile('name', t)}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={profileData.email}
                onChangeText={(t) => updateProfile('email', t)}
            />
            <TextInput
                style={styles.input}
                placeholder="Emergency Contact"
                keyboardType="phone-pad"
                value={profileData.emergencyContact}
                onChangeText={(t) => updateProfile('emergencyContact', t)}
            />
            <TextInput
                style={styles.input}
                placeholder="Street Address"
                value={profileData.address.street}
                onChangeText={(t) => setProfileData(prev => ({ ...prev, address: { ...prev.address, street: t } }))}
            />
            <TextInput
                style={styles.input}
                placeholder="City"
                value={profileData.address.city}
                onChangeText={(t) => setProfileData(prev => ({ ...prev, address: { ...prev.address, city: t } }))}
            />
            <TextInput
                style={styles.input}
                placeholder="PMDC Registration Number"
                value={profileData.pmdcRegistrationNumber}
                onChangeText={(t) => updateProfile('pmdcRegistrationNumber', t)}
            />
            <TextInput
                style={styles.input}
                placeholder="Years of Experience"
                keyboardType="numeric"
                value={profileData.experience}
                onChangeText={(t) => updateProfile('experience', t)}
            />
        </View>
    );

    const addEducation = () => {
        if (!tempEducation.degree || !tempEducation.institute) return Alert.alert('Error', 'Fill required fields');
        setProfileData(prev => ({ ...prev, education: [...prev.education, tempEducation] }));
        setTempEducation({ degree: '', institute: '', startYear: '', endYear: '' });
    };

    const renderEducation = () => (
        <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Education</Text>

            {profileData.education.map((edu, index) => (
                <View key={index} style={styles.cardItem}>
                    <Text style={styles.cardTitle}>{edu.degree}</Text>
                    <Text>{edu.institute}</Text>
                    <Text style={styles.cardSubtitle}>{edu.startYear} - {edu.endYear}</Text>
                    <TouchableOpacity onPress={() => {
                        const newEdu = [...profileData.education];
                        newEdu.splice(index, 1);
                        updateProfile('education', newEdu);
                    }}>
                        <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            ))}

            <View style={styles.addItemContainer}>
                <Text style={styles.subTitle}>Add Education</Text>
                <TextInput style={styles.input} placeholder="Degree" value={tempEducation.degree} onChangeText={t => setTempEducation({ ...tempEducation, degree: t })} />
                <TextInput style={styles.input} placeholder="Institute" value={tempEducation.institute} onChangeText={t => setTempEducation({ ...tempEducation, institute: t })} />
                <View style={styles.row}>
                    <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Start Year" keyboardType="numeric" value={tempEducation.startYear} onChangeText={t => setTempEducation({ ...tempEducation, startYear: t })} />
                    <TextInput style={[styles.input, { flex: 1 }]} placeholder="End Year" keyboardType="numeric" value={tempEducation.endYear} onChangeText={t => setTempEducation({ ...tempEducation, endYear: t })} />
                </View>
                <TouchableOpacity style={styles.addButton} onPress={addEducation}>
                    <Text style={styles.addButtonText}>Add Education</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const addLocation = () => {
        if (!tempLocation.name) return Alert.alert('Error', 'Name is required');
        // If not online, lat/lng required
        if (!tempLocation.isOnline && (!tempLocation.lat || !tempLocation.lng)) {
            return Alert.alert('Error', 'Coordinates required for in-clinic locations');
        }

        const loc: any = {
            name: tempLocation.name,
            phone: tempLocation.phone
        };

        // Always add coordinates - for online consultations, use default (0, 0)
        if (!tempLocation.isOnline) {
            loc.coordinates = { lat: parseFloat(tempLocation.lat), lng: parseFloat(tempLocation.lng) };
        } else {
            // For online consultations, provide default coordinates to satisfy backend validation
            loc.coordinates = { lat: 0, lng: 0 };
        }

        setProfileData(prev => ({ ...prev, locations: [...prev.locations, loc] }));
        setTempLocation({ name: '', phone: '', lat: '', lng: '', isOnline: false });
    };

    const renderLocations = () => (
        <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Locations</Text>

            {profileData.locations.map((loc, index) => (
                <View key={index} style={styles.cardItem}>
                    <Text style={styles.cardTitle}>{loc.name}</Text>
                    <Text>{loc.phone}</Text>
                    {loc.coordinates ? (
                        <Text style={styles.cardSubtitle}>Lat: {loc.coordinates.lat}, Lng: {loc.coordinates.lng}</Text>
                    ) : (
                        <Text style={styles.cardSubtitle}>Online Consultation</Text>
                    )}
                    <TouchableOpacity onPress={() => {
                        const newLoc = [...profileData.locations];
                        newLoc.splice(index, 1);
                        updateProfile('locations', newLoc);
                    }}>
                        <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            ))}

            <View style={styles.addItemContainer}>
                <Text style={styles.subTitle}>Add Location</Text>

                <View style={styles.row}>
                    <Text>Online Consultation?</Text>
                    <Switch value={tempLocation.isOnline} onValueChange={v => setTempLocation({ ...tempLocation, isOnline: v })} />
                </View>

                <TextInput style={styles.input} placeholder="Location Name (e.g. City Hospital or Online)" value={tempLocation.name} onChangeText={t => setTempLocation({ ...tempLocation, name: t })} />
                <TextInput style={styles.input} placeholder="Phone" keyboardType="phone-pad" value={tempLocation.phone} onChangeText={t => setTempLocation({ ...tempLocation, phone: t })} />

                {!tempLocation.isOnline && (
                    <View style={styles.row}>
                        <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Latitude" keyboardType="numeric" value={tempLocation.lat} onChangeText={t => setTempLocation({ ...tempLocation, lat: t })} />
                        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Longitude" keyboardType="numeric" value={tempLocation.lng} onChangeText={t => setTempLocation({ ...tempLocation, lng: t })} />
                    </View>
                )}

                <TouchableOpacity style={styles.addButton} onPress={addLocation}>
                    <Text style={styles.addButtonText}>Add Location</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const addAvailability = () => {
        if (!tempAvailability.startTime || !tempAvailability.endTime) return Alert.alert('Error', 'Time is required');
        setProfileData(prev => ({ ...prev, availability: [...prev.availability, tempAvailability] }));
        // Reset mostly but keep some sensible defaults maybe?
        setTempAvailability({ ...tempAvailability, startTime: '', endTime: '' });
    };

    const renderAvailability = () => (
        <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Availability</Text>
            {profileData.availability.map((avail, index) => (
                <View key={index} style={styles.cardItem}>
                    <Text style={styles.cardTitle}>{avail.day}</Text>
                    <Text>{avail.startTime} - {avail.endTime}</Text>
                    <Text style={styles.cardSubtitle}>{avail.appointmentType} at {avail.locationName}</Text>
                    <TouchableOpacity onPress={() => {
                        const newAvail = [...profileData.availability];
                        newAvail.splice(index, 1);
                        updateProfile('availability', newAvail);
                    }}>
                        <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            ))}

            <View style={styles.addItemContainer}>
                <Text style={styles.subTitle}>Add Slot</Text>
                <TextInput style={styles.input} placeholder="Day (e.g. Monday)" value={tempAvailability.day} onChangeText={t => setTempAvailability({ ...tempAvailability, day: t })} />

                <View style={styles.row}>
                    <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Start Time (09:00)" value={tempAvailability.startTime} onChangeText={t => setTempAvailability({ ...tempAvailability, startTime: t })} />
                    <TextInput style={[styles.input, { flex: 1 }]} placeholder="End Time (17:00)" value={tempAvailability.endTime} onChangeText={t => setTempAvailability({ ...tempAvailability, endTime: t })} />
                </View>

                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.chip, tempAvailability.appointmentType === 'inclinic' && styles.chipActive]}
                        onPress={() => setTempAvailability({ ...tempAvailability, appointmentType: 'inclinic' })}
                    >
                        <Text style={[styles.chipText, tempAvailability.appointmentType === 'inclinic' && styles.chipTextActive]}>In-Clinic</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chip, tempAvailability.appointmentType === 'online' && styles.chipActive]}
                        onPress={() => setTempAvailability({ ...tempAvailability, appointmentType: 'online' })}
                    >
                        <Text style={[styles.chipText, tempAvailability.appointmentType === 'online' && styles.chipTextActive]}>Online</Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Location Name (Must match added locations)"
                    value={tempAvailability.locationName}
                    onChangeText={t => setTempAvailability({ ...tempAvailability, locationName: t })}
                />

                <TouchableOpacity style={styles.addButton} onPress={addAvailability}>
                    <Text style={styles.addButtonText}>Add Availability</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Complete Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            {renderProgressBar()}

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {currentStep === 0 && renderPersonalInfo()}
                {currentStep === 1 && renderEducation()}
                {currentStep === 2 && renderLocations()}
                {currentStep === 3 && renderAvailability()}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>
                        {loading ? <ActivityIndicator color="#FFF" /> : (currentStep === STEPS.length - 1 ? 'Finish' : 'Next')}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    backButton: { padding: 4 },
    progressContainer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 20 },
    stepWrapper: { flexDirection: 'row', alignItems: 'center' },
    stepCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 },
    stepCircleActive: { backgroundColor: '#5B7FFF' },
    stepNumber: { color: '#666', fontWeight: 'bold' },
    stepNumberActive: { color: '#FFF' },
    stepLine: { width: 20, height: 2, backgroundColor: '#E0E0E0' },
    stepLineActive: { backgroundColor: '#5B7FFF' },
    scrollContent: { padding: 20, flexGrow: 1 },
    formContainer: { flex: 1 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16, backgroundColor: '#FAFAFA' },
    addItemContainer: { marginTop: 20, padding: 16, backgroundColor: '#F9F9F9', borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
    subTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    addButton: { backgroundColor: '#333', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    addButtonText: { color: '#FFF', fontWeight: '600' },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    cardItem: { padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#eee', elevation: 1 },
    cardTitle: { fontWeight: 'bold', fontSize: 16 },
    cardSubtitle: { color: '#666', fontSize: 12, marginTop: 4 },
    deleteText: { color: 'red', fontSize: 12, marginTop: 8, fontWeight: '600' },
    chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F0F0F0', marginRight: 10 },
    chipActive: { backgroundColor: '#5B7FFF' },
    chipText: { color: '#666' },
    chipTextActive: { color: '#FFF' },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    nextButton: { backgroundColor: '#5B7FFF', padding: 16, borderRadius: 12, alignItems: 'center' },
    nextButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default DoctorProfileSetupScreen;
