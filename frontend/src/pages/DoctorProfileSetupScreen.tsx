import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
  // Added Image
    Dimensions,
  PermissionsAndroid,
  Platform,
  Linking,
} from 'react-native';
import { launchCamera, launchImageLibrary, MediaType } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSpecialities, Speciality } from '../services/doctorService';
import { DoctorStatus } from '../types/enums';
import { useAuthState } from '../navigation/authState';
import { createResponsiveStyles } from '../utils/responsive';


// --- REFRACTORED COMPONENTS & STYLES ---

const ProfileInput = ({ label, value, onChangeText, placeholder, icon, keyboardType, multiline, rightElement, leftElement, error }: any) => (
    <View style={[
        styles.profileInputContainer,
        leftElement && { paddingHorizontal: 0, paddingVertical: 0, height: 56, overflow: 'hidden' }
    ]}>
        {leftElement}
        {icon && !leftElement && (
            <View style={styles.profileInputIcon}>
                <Icon name={icon} size={20} color="#666" />
            </View>
        )}
        <View style={[
            styles.profileInputContent,
            leftElement && { paddingLeft: 12, justifyContent: 'center' }
        ]}>
            <Text style={styles.profileInputLabel}>{label}</Text>
            <TextInput
                style={[styles.profileInput, multiline && { minHeight: 60, height: 'auto', textAlignVertical: 'top' }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999"
                keyboardType={keyboardType}
                multiline={multiline}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
        {rightElement}
    </View>
);

const ProfileDropdown = ({ label, value, onPress, placeholder, icon }: any) => (
    <TouchableOpacity onPress={onPress} style={styles.profileInputContainer}>
        {icon && (
            <View style={styles.profileInputIcon}>
                <Icon name={icon} size={20} color="#666" />
            </View>
        )}
        <View style={styles.profileInputContent}>
            <Text style={styles.profileInputLabel}>{label}</Text>
            <Text style={[styles.profileInput, !value && { color: '#999' }]}>
                {value || placeholder}
            </Text>
        </View>
        <Icon name="chevron-down" size={20} color="#999" style={{ marginRight: 10 }} />
    </TouchableOpacity>
);


// CONSTANTS
const LANGUAGES = ['English', 'Urdu', 'Pashto'];
const YEARS = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i));
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = (i % 2) * 30;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
});

interface SelectionModalProps {
    visible: boolean;
    title: string;
    options: string[];
    selectedValues: string | string[];
    onSelect: (value: string | string[]) => void;
    onClose: () => void;
    multiSelect?: boolean;
}

const SelectionModal = ({ visible, title, options, selectedValues, onSelect, onClose, multiSelect }: SelectionModalProps) => {
    const [tempSelected, setTempSelected] = React.useState<string | string[]>(selectedValues);

    React.useEffect(() => {
        setTempSelected(selectedValues);
    }, [visible, selectedValues]);

    const toggleSelection = (option: string) => {
        if (multiSelect) {
            const current = Array.isArray(tempSelected) ? [...tempSelected] : [];
            if (current.includes(option)) {
                setTempSelected(current.filter(item => item !== option));
            } else {
                setTempSelected([...current, option]);
            }
        } else {
            setTempSelected(option);
            onSelect(option); // Auto-close/select for single
            onClose();
        }
    };

    const handleConfirm = () => {
        onSelect(tempSelected);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}><Icon name="close" size={24} color="#333" /></TouchableOpacity>
                    </View>
                    <FlatList
                        data={options}
                        keyExtractor={item => item}
                        renderItem={({ item }) => {
                            const isSelected = multiSelect
                                ? (Array.isArray(tempSelected) && tempSelected.includes(item))
                                : tempSelected === item;
                            return (
                                <TouchableOpacity
                                    style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                                    onPress={() => toggleSelection(item)}
                                >
                                    <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>{item}</Text>
                                    {isSelected && <Icon name="checkmark" size={20} color="#5B7FFF" />}
                                </TouchableOpacity>
                            );
                        }}
                    />
                    {multiSelect && (
                        <TouchableOpacity style={styles.modalConfirmButton} onPress={handleConfirm}>
                            <Text style={styles.modalConfirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};

// Gender Selection Modal with Icon Cards
interface GenderSelectionModalProps {
    visible: boolean;
    selectedGender: string;
    onSelect: (gender: string) => void;
    onClose: () => void;
}

const GenderSelectionModal = ({ visible, selectedGender, onSelect, onClose }: GenderSelectionModalProps) => {
    const genderOptions = [
        { value: 'Male', icon: 'male', color: '#5B7FFF', bgColor: '#EEF2FF' },
        { value: 'Female', icon: 'female', color: '#EC4899', bgColor: '#FCE7F3' },
        { value: 'Other', icon: 'transgender', color: '#8B5CF6', bgColor: '#F3E8FF' },
    ];

    const handleSelect = (gender: string) => {
        onSelect(gender);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.genderModalOverlay}>
                <View style={styles.genderModalContent}>
                    <View style={styles.genderModalHeader}>
                        <Text style={styles.genderModalTitle}>Select Gender</Text>
                        <TouchableOpacity onPress={onClose} style={styles.genderCloseButton}>
                            <Icon name="close-circle" size={28} color="#999" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.genderCardsContainer}>
                        {genderOptions.map((option) => {
                            const isSelected = selectedGender === option.value;
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.genderCard,
                                        isSelected && { ...styles.genderCardSelected, borderColor: option.color }
                                    ]}
                                    onPress={() => handleSelect(option.value)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.genderIconContainer, { backgroundColor: option.bgColor }]}>
                                        <Icon name={option.icon} size={40} color={option.color} />
                                    </View>
                                    <Text style={[styles.genderCardText, isSelected && { color: option.color, fontWeight: '700' }]}>
                                        {option.value}
                                    </Text>
                                    {isSelected && (
                                        <View style={[styles.genderCheckmark, { backgroundColor: option.color }]}>
                                            <Icon name="checkmark" size={16} color="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// Helper for Phone Formatting - Pakistan Format (+92 followed by 10 digits)
const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    let cleaned = value.replace(/\D/g, '');

    // Remove leading 0 if present (Pakistani mobile numbers often start with 0)
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }

    // Remove 92 prefix if user typed it (we'll add +92 ourselves)
    if (cleaned.startsWith('92')) {
        cleaned = cleaned.substring(2);
    }

    // Limit to 10 digits (after country code)
    cleaned = cleaned.substring(0, 10);

    // Return with +92 prefix
    return cleaned.length > 0 ? `+92${cleaned}` : '';
};

const STEPS = ['Personal Info', 'Education', 'Practice Details', 'Availability'];

const DoctorProfileSetupScreen = () => {
    const navigation = useNavigation<any>();
    const { signIn } = useAuthState();
    const [currentStep, setCurrentStep] = useState(0);
    const [genderModalVisible, setGenderModalVisible] = useState(false);

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        visible: boolean;
        title: string;
        options: string[];
        selectedValues: string | string[];
        multiSelect: boolean;
        onSelect: (val: any) => void;
    }>({
        visible: false,
        title: '',
        options: [],
        selectedValues: [],
        multiSelect: false,
        onSelect: () => { },
    });

    const openModal = (
        title: string,
        options: string[],
        selectedValues: string | string[],
        multiSelect: boolean,
        onSelect: (val: any) => void
    ) => {
        setModalConfig({ visible: true, title, options, selectedValues, multiSelect, onSelect });
    };

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, visible: false }));
    };

    // Form State
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        emergencyContact: '',
        address: { street: '', city: '' },
        pmdcRegistrationNumber: '',
        experience: '',
        superSpeciality: '',
        speciality: '',
        specialityId: '',
        gender: '',
        about: '',
        languages: [] as string[],
        fees: { online: '', inclinic: '' },
        services: [] as string[],
        consultationTime: '15',
        locations: [] as any[],
        education: [] as any[],
        awards: [] as any[],
        memberships: [] as string[],
        availability: [] as any[],
        image: ''
    });

    // Temporary states for adding items
    const [tempEducation, setTempEducation] = useState({ degree: '', institute: '', startYear: '', endYear: '' });
    const [tempAward, setTempAward] = useState({ name: '', year: '' });
    const [tempMembership, setTempMembership] = useState('');
    const [tempLocation, setTempLocation] = useState({ name: '', phone: '', lat: '', lng: '', isOnline: false });
    const [tempAvailability, setTempAvailability] = useState({ day: 'Monday', startTime: '', endTime: '', appointmentType: 'inclinic', locationName: '' });

    // Specialities state
    const [specialities, setSpecialities] = useState<Speciality[]>([]);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const handleSupport = () => {
        Alert.alert(
            "Technical Support",
            "Need help with registration? Contact our support team.",
            [
                {
                    text: "Chat on WhatsApp",
                    onPress: async () => {
                        const url = 'https://wa.me/923018153293';
                        try {
                            const supported = await Linking.canOpenURL(url);
                            if (supported) {
                                await Linking.openURL(url);
                            } else {
                                Alert.alert("Error", "WhatsApp is not installed or the link is invalid.");
                            }
                        } catch (err) {
                            console.error("An error occurred", err);
                        }
                    }
                },
                { text: "Close", style: "cancel" }
            ]
        );
    };

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
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isNewProfile, setIsNewProfile] = useState(true);

    // Get userId and token from navigation params
    const route = useRoute();
    const { userId: routeUserId, token: routeToken } = (route.params as { userId: string; token: string }) || {};

    React.useEffect(() => {
        const params = route.params as any;
        // Prevent re-fetching if we are just returning from location selection
        if (params?.selectedLocation) {
            return;
        }

        const loadAuthData = async () => {
            try {
                // Try to get from AsyncStorage first
                const storedToken = await AsyncStorage.getItem('token');
                const storedUserId = await AsyncStorage.getItem('userId');

                const finalToken = storedToken || routeToken;
                const finalUserId = storedUserId || routeUserId;

                setAuthToken(finalToken);

                console.log('DoctorProfileSetup - Using userId:', finalUserId);
                console.log('DoctorProfileSetup - Using token:', finalToken ? 'Token present' : 'No token');

                if (!finalUserId) {
                    Alert.alert(
                        'Session Error',
                        'User Identification missing. Please login again.',
                        [{ text: 'Go to Login', onPress: () => navigation.navigate('Login') }]
                    );
                } else {
                    // Fetch existing profile data
                    fetchDoctorProfile(finalUserId, finalToken);
                }
            } catch (error) {
                console.error('Error loading auth data:', error);
            }
        };

        loadAuthData();
    }, [routeUserId, routeToken, (route.params as any)?.selectedLocation]);

    // Fetch specialities on mount
    React.useEffect(() => {
        const loadSpecialities = async () => {
            const specs = await getSpecialities();
            setSpecialities(specs);
        };
        loadSpecialities();
    }, []);



    const fetchDoctorProfile = async (userId: string | null, token: string | null) => {
        if (!userId) return;

        try {
            console.log('Fetching doctor profile for userId:', userId);
            let doctorData = null;

            // 1. Try specific userId endpoint
            const response = await fetch(`https://appbookingbackend.onrender.com/api/doctor/profile/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            if (response.status === 200 || response.status === 201) {
                const data = await response.json();
                doctorData = data.data || data.doctor || data;
                if (Array.isArray(doctorData)) doctorData = doctorData[0];
            }

            // 2. Fallback: Robust search by WhatsApp (using normalization)
            if (!doctorData) {
                const storedPhone = await AsyncStorage.getItem('whatsappnumber');
                if (storedPhone) {
                    console.log('Fallback: Searching by WhatsApp number:', storedPhone);
                    const allResponse = await fetch('https://appbookingbackend.onrender.com/api/doctor', {
                        headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
                    });

                    if (allResponse.ok) {
                        const allData = await allResponse.json();
                        const allDoctors = allData.data?.doctors || allData.data || allData;

                        const normalizePhone = (phone: string | undefined): string => {
                            if (!phone) return '';
                            let clean = phone.replace(/\D/g, '');
                            if (clean.startsWith('92')) clean = clean.substring(2);
                            if (clean.startsWith('0')) clean = clean.substring(1);
                            return clean;
                        };

                        const normalizedTarget = normalizePhone(storedPhone);
                        if (Array.isArray(allDoctors)) {
                            doctorData = allDoctors.find((d: any) =>
                                normalizePhone(d.whatsappnumber) === normalizedTarget && normalizedTarget !== ''
                            );
                            if (doctorData) console.log('Found profile via WhatsApp fallback in Setup Screen');
                        }
                    }
                }
            }

            if (doctorData) {
                // Populate form
                setProfileData({
                    name: doctorData.name || '',
                    email: doctorData.email || '',
                    emergencyContact: doctorData.emergencyContact || '',
                    address: doctorData.address || { street: '', city: '' },
                    pmdcRegistrationNumber: doctorData.pmdcRegistrationNumber || '',
                    experience: doctorData.experience ? String(doctorData.experience) : '',
                    about: doctorData.about || '',
                    gender: doctorData.gender || '',
                    languages: doctorData.languages || [],
                    superSpeciality: doctorData.superSpeciality || '',
                    speciality: doctorData.speciality || '',
                    specialityId: doctorData.specialityId || '',
                    services: doctorData.services || [],
                    fees: {
                        online: doctorData.fees?.online ? String(doctorData.fees.online) : '',
                        inclinic: doctorData.fees?.inclinic ? String(doctorData.fees.inclinic) : ''
                    },
                    consultationTime: doctorData.consultationTime ? String(doctorData.consultationTime) : '15',
                    locations: doctorData.locations || [],
                    education: doctorData.education || [],
                    awards: doctorData.awards || [],
                    memberships: doctorData.memberships || [],
                    availability: doctorData.availability || [],
                    image: doctorData.image || ''
                });

                const rawStatus = (doctorData.status || '').toUpperCase();
                console.log('Fetched Profile Status:', rawStatus);

                // Normalize status
                let doctorStatus = DoctorStatus.IN_PROGRESS;
                if (rawStatus === 'ACTIVE' || rawStatus === 'APPROVED') {
                    doctorStatus = DoctorStatus.ACTIVE;
                } else if (rawStatus === 'PENDING') {
                    doctorStatus = DoctorStatus.PENDING;
                }

                // Update local storage
                await AsyncStorage.setItem('doctorStatus', doctorStatus);
                console.log('Normalized Status for Storage:', doctorStatus);

                if (doctorStatus === DoctorStatus.ACTIVE) {
                    console.log('Doctor is ACTIVE/APPROVED. Redirecting to Main.');
                    signIn();
                    return;
                } else if (doctorStatus === DoctorStatus.PENDING) {
                    console.log('Doctor is PENDING. Redirecting to PendingVerification.');
                    navigation.reset({ index: 0, routes: [{ name: 'PendingVerification' }] });
                    return;
                }

                setIsNewProfile(false);

                // Store doctorId for submissions
                const foundDoctorId = doctorData._id || doctorData.id || doctorData.doctorId;
                if (foundDoctorId) {
                    await AsyncStorage.setItem('doctorId', foundDoctorId);
                }
            } else {
                console.log('No existing profile found after all checks, starting fresh');
                setIsNewProfile(true);
            }
        } catch (error) {
            console.error('Error in robust profile fetch:', error);
            setIsNewProfile(true);
        }
    };

    const handleSubmit = async () => {
        // Validate minimal requirement
        if (!profileData.name || !profileData.email) {
            Alert.alert('Error', 'Please fill in personal information');
            return;
        }

        // Get current userId and token from AsyncStorage
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedToken = await AsyncStorage.getItem('token');
        const finalUserId = storedUserId || routeUserId;
        const finalToken = storedToken || routeToken || authToken;

        if (!finalUserId) {
            Alert.alert('Session Error', 'User ID is missing. Please login again.', [
                { text: 'Go to Login', onPress: () => navigation.navigate('Login') }
            ]);
            return;
        }

        if (!finalToken) {
            Alert.alert('Session Expired', 'Authentication token is missing. Please login again.', [
                { text: 'Go to Login', onPress: () => navigation.navigate('Login') }
            ]);
            return;
        }

        console.log('[DEBUG] finalUserId:', finalUserId);
        console.log('[DEBUG] Token present: Yes');
        console.log('[DEBUG] Token (first 10 chars):', finalToken.substring(0, 10));

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

            const storedDoctorId = await AsyncStorage.getItem('doctorId');

            const payload = {
                userId: finalUserId,
                role: 'doctor',
                ...(storedDoctorId && { doctorId: storedDoctorId }), // Include doc ID if we have it
                name: profileData.name,
                email: profileData.email,
                emergencyContact: profileData.emergencyContact,
                address: profileData.address,
                pmdcRegistrationNumber: profileData.pmdcRegistrationNumber,
                experience: parseInt(profileData.experience) || 0,
                about: profileData.about,
                gender: profileData.gender,
                languages: profileData.languages,
                locations: sanitizedLocations,
                education: profileData.education,
                awards: profileData.awards,
                memberships: profileData.memberships,
                availability: profileData.availability,
                superSpeciality: profileData.superSpeciality,
                speciality: profileData.speciality,
                specialityId: profileData.specialityId,
                services: profileData.services,
                fees: {
                    online: parseInt(profileData.fees.online) || 0,
                    inclinic: parseInt(profileData.fees.inclinic) || 0
                },
                consultationTime: parseInt(profileData.consultationTime) || 15,
                image: profileData.image,
            };

            console.log('=== DEBUG: Locations Array ===');
            console.log('Number of locations:', sanitizedLocations.length);
            sanitizedLocations.forEach((loc, idx) => {
                console.log(`Location ${idx}:`, JSON.stringify(loc, null, 2));
            });
            console.log('=== END DEBUG ===');

            // User specified to use PUT and update-profile endpoint
            const url = 'https://appbookingbackend.onrender.com/api/doctor/update-profile';
            const method = 'PUT';

            // Ensure token is clean and has Bearer prefix if needed (already handled in header)
            const tokenToUse = finalToken?.trim() || '';

            console.log(`[DEBUG] Request URL: ${url}`);
            console.log(`[DEBUG] Method: ${method}`);
            console.log(`[DEBUG] Token Length: ${tokenToUse.length}`);
            console.log(`Using ${method} ${url} for ${isNewProfile ? 'NEW' : 'EXISTING'} profile`);

            if (!tokenToUse) {
                console.warn('[WARNING] Attempting update-profile without a token!');
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenToUse}`
                },
                body: JSON.stringify(payload),
            });

            console.log(`[API RESPONSE] Status: ${response.status} (${response.statusText})`);
            const responseText = await response.text();

            if (!response.ok) {
                console.error(`[API ERROR] ${method} ${url} failed with status ${response.status}`);
                console.error('Response text:', responseText.substring(0, 1000));
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                throw new Error(`Server returned non-JSON response (${response.status}): ${responseText.substring(0, 100)}`);
            }

            console.log('Profile submission response:', JSON.stringify(data, null, 2));

            if (response.ok) {
                // Store doctorId if available in response
                const doctorId = data.data?._id || data.data?.id || data.data?.doctorId || data.doctor?._id || data._id || data.doctorId;
                if (doctorId) {
                    await AsyncStorage.setItem('doctorId', doctorId);
                    console.log('Stored doctorId in AsyncStorage:', doctorId);

                    // Extract status from API response
                    const serverStatus = (data.data?.status || data.doctor?.status || data.status || 'PENDING').toUpperCase();
                    await AsyncStorage.setItem('doctorStatus', serverStatus);
                    console.log('Updated doctorStatus from API to:', serverStatus);

                    if (serverStatus === 'ACTIVE') {
                        Alert.alert('Success', 'Profile saved successfully!', [
                            {
                                text: 'OK',
                                onPress: () => signIn(),
                            }
                        ]);
                    } else {
                        Alert.alert('Success', 'Profile submitted for review!', [
                            {
                                text: 'OK',
                                onPress: () => navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'PendingVerification' }],
                                })
                            }
                        ]);
                    }
                } else {
                    // Fallback if ID/Status missing, assume Pending for safety but log warning
                    console.warn('Could not extract doctorId/status from response, defaulting to Pending logic');
                    Alert.alert('Success', 'Profile saved successfully!', [
                        {
                            text: 'OK',
                            onPress: () => navigation.reset({
                                index: 0,
                                routes: [{ name: 'PendingVerification' }],
                            })
                        }
                    ]);
                }
            } else {
                Alert.alert('Error', data.message || `Failed to save profile (Status ${response.status})`);
            }
        } catch (error: any) {
            console.error('Update profile error:', error);
            Alert.alert('Error', error.message || 'Network error or server unreachable');
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = (key: string, value: any) => {
        setProfileData(prev => ({ ...prev, [key]: value }));
    };

    // --- Render Steps ---

    const handleImageUpload = async (type: 'camera' | 'library') => {
        const options: any = {
            mediaType: 'photo',
            includeBase64: true,
            quality: 0.8,
            maxWidth: 800,
            maxHeight: 800,
        };

        const callback = (response: any) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);

                if (response.errorMessage?.includes('No Activity found')) {
                    Alert.alert(
                        'Gallery Error',
                        'Your device does not support the modern Photo Picker (common on some emulators). Please use the Camera option instead.'
                    );
                } else if (response.errorCode === 'permission') {
                    Alert.alert('Permission Denied', 'Please enable permissions in settings.');
                } else {
                    Alert.alert('Error', `Image selection failed: ${response.errorMessage || 'Unknown error'}`);
                }
            } else if (response.assets && response.assets.length > 0) {
                const asset = response.assets[0];

                // 1. Size Validation (5MB = 5 * 1024 * 1024 bytes)
                if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
                    Alert.alert('Size Limit Exceeded', 'Uploads are restricted to a maximum of 5MB.');
                    return;
                }

                // 2. Type Validation
                const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                if (asset.type && !validTypes.includes(asset.type)) {
                    Alert.alert('Invalid File Type', 'Only JPEG, PNG, and WEBP images are allowed.');
                    return;
                }

                // 3. Update State with Base64
                // Construct data URI: data:image/jpeg;base64,...
                const source = `data:${asset.type};base64,${asset.base64}`;
                updateProfile('image', source);
            }
        };

        if (type === 'camera') {
            if (Platform.OS === 'android') {
                try {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.CAMERA,
                        {
                            title: "Camera Permission",
                            message: "App needs access to your camera to take profile photos.",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK"
                        }
                    );
                    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                        launchCamera(options, callback);
                    } else {
                        Alert.alert("Permission Denied", "Camera permission is required to take photos.");
                    }
                } catch (err) {
                    console.warn(err);
                }
            } else {
                launchCamera(options, callback);
            }
        } else {
            launchImageLibrary(options, callback);
        }
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerTopRow}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Application For Registration</Text>
                <TouchableOpacity onPress={handleSupport} style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 }}>
                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>Help</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.avatarContainer}>
                <View style={styles.avatarWrapper}>
                    {profileData.image ? (
                        <Image source={{ uri: profileData.image }} style={styles.avatarImage} />
                    ) : (
                        <View style={[styles.avatarImage, { backgroundColor: '#E1E8FF', alignItems: 'center', justifyContent: 'center' }]}>
                            <Icon name="person" size={60} color="#5B7FFF" />
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.editIconContainer}
                        onPress={() => {
                            Alert.alert(
                                "Update Profile Photo",
                                "Select an option",
                                [
                                    { text: "Take Photo", onPress: () => handleImageUpload('camera') },
                                    { text: "Choose from Gallery", onPress: () => handleImageUpload('library') },
                                    { text: "Cancel", style: "cancel" }
                                ]
                            );
                        }}
                    >
                        <Icon name="camera" size={16} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
                {STEPS.map((step, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.tabItem, currentStep === index && styles.tabItemActive]}
                        onPress={() => setCurrentStep(index)}
                    >
                        <Text style={[styles.tabText, currentStep === index && styles.tabTextActive]}>
                            {step}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderPersonalInfo = () => (
        <View style={styles.formContainer}>
            <ProfileInput
                label="Name"
                icon="person-outline"
                placeholder="Muhammad khan"
                value={profileData.name}
                onChangeText={(t: string) => updateProfile('name', t)}
            />

            <ProfileInput
                label="Email"
                icon="mail-outline"
                placeholder="doctor@example.com"
                value={profileData.email}
                onChangeText={(t: string) => updateProfile('email', t)}
                keyboardType="email-address"
            />


            <ProfileDropdown
                label="Gender"
                icon="male-female-outline"
                value={profileData.gender}
                onPress={() => setGenderModalVisible(true)}
            />

            <ProfileInput
                label="Mobile No"
                value={profileData.emergencyContact}
                onChangeText={(t: string) => updateProfile('emergencyContact', t)}
                keyboardType="phone-pad"
                leftElement={
                    <View style={{
                        backgroundColor: '#F1F5F9',
                        height: '100%',
                        paddingHorizontal: 16,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRightWidth: 1,
                        borderRightColor: '#E0E0E0',
                        marginRight: 0,
                    }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A1F3A' }}>+92</Text>
                    </View>
                }
            />
            <ProfileInput
                label="Address (District/City)"
                icon="location-outline"
                value={profileData.address.city}
                onChangeText={(t: string) => setProfileData(prev => ({ ...prev, address: { ...prev.address, city: t } }))}
            />

            <ProfileInput
                label="Street Address"
                icon="home-outline"
                value={profileData.address.street}
                onChangeText={(t: string) => setProfileData(prev => ({ ...prev, address: { ...prev.address, street: t } }))}
            />

            <ProfileInput
                label="About / Bio"
                icon="information-circle-outline"
                value={profileData.about}
                onChangeText={(t: string) => updateProfile('about', t)}
                multiline
            />

            <ProfileDropdown
                label="Languages"
                icon="language-outline"
                value={profileData.languages && profileData.languages.join(', ')}
                placeholder="Select Languages"
                onPress={() => openModal('Select Languages', LANGUAGES, profileData.languages, true, (vals) => updateProfile('languages', vals))}
            />

            <ProfileInput
                label="PMDC Reg No"
                icon="card-outline"
                value={profileData.pmdcRegistrationNumber}
                onChangeText={(t: string) => updateProfile('pmdcRegistrationNumber', t)}
            />

            <ProfileInput
                label="Experience (Years)"
                icon="time-outline"
                value={profileData.experience}
                onChangeText={(t: string) => updateProfile('experience', t)}
                keyboardType="numeric"
            />

            <Text style={[styles.label, { marginTop: 20 }]}>Speciality</Text>
            <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {specialities.map((spec, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.chip,
                                profileData.specialityId === spec._id && styles.chipActive
                            ]}
                            onPress={() => {
                                updateProfile('speciality', spec.speciality);
                                updateProfile('specialityId', spec._id || '');
                                updateProfile('superSpeciality', '');
                                updateProfile('services', []);
                            }}
                        >
                            <Text style={[
                                styles.chipText,
                                profileData.specialityId === spec._id && styles.chipTextActive
                            ]}>
                                {spec.speciality}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {profileData.specialityId && (() => {
                const selectedSpec = specialities.find(s => s._id === profileData.specialityId);
                const superSpecs = selectedSpec?.super_specialities || [];
                return superSpecs.length > 0 ? (
                    <>
                        <Text style={styles.label}>Super Speciality</Text>
                        <View style={styles.pickerContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                {superSpecs.map((superSpec, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.chip,
                                            profileData.superSpeciality === superSpec.name && styles.chipActive
                                        ]}
                                        onPress={() => {
                                            updateProfile('superSpeciality', superSpec.name);
                                            updateProfile('services', []);
                                        }}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            profileData.superSpeciality === superSpec.name && styles.chipTextActive
                                        ]}>
                                            {superSpec.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </>
                ) : null;
            })()}

            <Text style={styles.label}>Services</Text>
            <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                    const selectedSpec = specialities.find(s => s._id === profileData.specialityId);
                    let availableServices: string[] = [];
                    if (selectedSpec) {
                        if (profileData.superSpeciality) {
                            const selectedSuper = selectedSpec.super_specialities.find(s => s.name === profileData.superSpeciality);
                            availableServices = selectedSuper?.services || [];
                        } else {
                            const allServices = selectedSpec.super_specialities.flatMap(s => s.services);
                            availableServices = [...new Set(allServices)];
                        }
                    }
                    if (availableServices.length === 0) {
                        Alert.alert('Info', 'Please select a speciality first to see available services.');
                        return;
                    }
                    openModal('Select Services', availableServices, profileData.services, true, (vals) => updateProfile('services', vals));
                }}
            >
                {profileData.services && profileData.services.length > 0 ? (
                    <Text style={styles.selectButtonText}>{profileData.services.join(', ')}</Text>
                ) : (
                    <Text style={styles.selectButtonPlaceholder}>Select Services</Text>
                )}
                <Icon name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

        </View>
    );

    const addEducation = () => {
        if (!tempEducation.degree || !tempEducation.institute) return Alert.alert('Error', 'Fill required fields');
        setProfileData(prev => ({ ...prev, education: [...prev.education, tempEducation] }));
        setTempEducation({ degree: '', institute: '', startYear: '', endYear: '' });
    };



    const addAward = () => {
        if (!tempAward.name || !tempAward.year) return Alert.alert('Error', 'Name and Year required');
        setProfileData(prev => ({ ...prev, awards: [...prev.awards, tempAward] }));
        setTempAward({ name: '', year: '' });
    };

    const addMembership = () => {
        if (!tempMembership) return Alert.alert('Error', 'Membership name required');
        setProfileData(prev => ({ ...prev, memberships: [...prev.memberships, tempMembership] }));
        setTempMembership('');
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
                <ProfileInput
                    label="Degree"
                    placeholder="e.g. MBBS"
                    value={tempEducation.degree}
                    onChangeText={(t: string) => setTempEducation({ ...tempEducation, degree: t })}
                    icon="school-outline"
                />
                <ProfileInput
                    label="Institute"
                    placeholder="e.g. King Edward Medical University"
                    value={tempEducation.institute}
                    onChangeText={(t: string) => setTempEducation({ ...tempEducation, institute: t })}
                    icon="business-outline"
                />
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[styles.selectButton, { flex: 1, marginRight: 5 }]}
                        onPress={() => openModal('Start Year', YEARS, tempEducation.startYear, false, (val) => setTempEducation({ ...tempEducation, startYear: val as string }))}
                    >
                        <Text style={tempEducation.startYear ? styles.selectButtonText : styles.selectButtonPlaceholder}>
                            {tempEducation.startYear || 'Start Year'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.selectButton, { flex: 1, marginLeft: 5 }]}
                        onPress={() => openModal('End Year', YEARS, tempEducation.endYear, false, (val) => setTempEducation({ ...tempEducation, endYear: val as string }))}
                    >
                        <Text style={tempEducation.endYear ? styles.selectButtonText : styles.selectButtonPlaceholder}>
                            {tempEducation.endYear || 'End Year'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={addEducation}>
                    <Text style={styles.addButtonText}>Add Education</Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Awards</Text>
            {profileData.awards.map((awr, index) => (
                <View key={index} style={styles.cardItem}>
                    <Text style={styles.cardTitle}>{awr.name}</Text>
                    <Text style={styles.cardSubtitle}>{awr.year}</Text>
                    <TouchableOpacity onPress={() => {
                        const newAwards = [...profileData.awards];
                        newAwards.splice(index, 1);
                        updateProfile('awards', newAwards);
                    }}>
                        <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            ))}
            <View style={styles.addItemContainer}>
                <ProfileInput label="Award Name" placeholder="e.g. Best Doctor 2023" value={tempAward.name} onChangeText={(t: string) => setTempAward({ ...tempAward, name: t })} icon="trophy-outline" />
                <ProfileDropdown
                    label="Year"
                    icon="calendar-outline"
                    value={tempAward.year}
                    placeholder="Year"
                    onPress={() => openModal('Year', YEARS, tempAward.year, false, (val) => setTempAward({ ...tempAward, year: val as string }))}
                />
                <TouchableOpacity style={styles.addButton} onPress={addAward}>
                    <Text style={styles.addButtonText}>Add Award</Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Memberships</Text>
            {profileData.memberships.map((mem, index) => (
                <View key={index} style={styles.cardItem}>
                    <Text style={styles.cardTitle}>{mem}</Text>
                    <TouchableOpacity onPress={() => {
                        const newMems = [...profileData.memberships];
                        newMems.splice(index, 1);
                        updateProfile('memberships', newMems);
                    }}>
                        <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            ))}
            <View style={styles.addItemContainer}>
                <ProfileInput label="Membership Name" placeholder="e.g. PMC, PMA" value={tempMembership} onChangeText={setTempMembership} icon="id-card-outline" />
                <TouchableOpacity style={styles.addButton} onPress={addMembership}>
                    <Text style={styles.addButtonText}>Add Membership</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const addLocation = () => {
        // If online, skip name/phone validation as they are hidden
        if (!tempLocation.isOnline) {
            if (!tempLocation.name) return Alert.alert('Error', 'Name is required');

            // Validate phone number format: +92 followed by 10 digits (total 13 characters)
            if (tempLocation.phone) {
                const phoneRegex = /^\+92\d{10}$/;
                if (!phoneRegex.test(tempLocation.phone)) {
                    return Alert.alert(
                        'Invalid Phone Format',
                        'Phone number must be in format: +92 followed by 10 digits (e.g., +923018153293)'
                    );
                }
            }

            // If not online, lat/lng required
            if (!tempLocation.lat || !tempLocation.lng) {
                return Alert.alert('Error', 'Coordinates required for in-clinic locations');
            }
        }

        const loc: any = {
            name: tempLocation.isOnline ? 'Online Consultation' : tempLocation.name,
            phone: tempLocation.isOnline ? '' : tempLocation.phone
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
            <Text style={styles.sectionTitle}>Practice Details</Text>

            {profileData.locations.map((loc, index) => (
                <View key={index} style={styles.cardItem}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.cardTitle}>{loc.name}</Text>
                        <TouchableOpacity onPress={() => {
                            const newLocs = [...profileData.locations];
                            newLocs.splice(index, 1);
                            updateProfile('locations', newLocs);
                        }}>
                            <Icon name="trash-outline" size={20} color="#FF5B5B" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.cardSubtitle}>{loc.phone}</Text>
                    {loc.isOnline && <View style={[styles.chip, styles.chipActive, { alignSelf: 'flex-start', marginTop: 5 }]}><Text style={styles.chipTextActive}>Online Consultation</Text></View>}
                    <Text style={{ fontSize: 12, color: '#999', marginTop: 5 }}>Coordinates: {loc.coordinates?.lat?.toFixed(4)}, {loc.coordinates?.lng?.toFixed(4)}</Text>
                </View>
            ))}

            <View style={styles.addItemContainer}>
                <Text style={styles.subTitle}>Add New Location</Text>

                <View style={[styles.row, { justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }]}>
                    <Text style={{ fontSize: 16 }}>Online Consultation Available?</Text>
                    <Switch
                        value={tempLocation.isOnline}
                        onValueChange={(val) => setTempLocation({ ...tempLocation, isOnline: val })}
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={tempLocation.isOnline ? "#0047AB" : "#f4f3f4"}
                    />
                </View>

                {!tempLocation.isOnline && (
                    <>
                        <TouchableOpacity
                            style={[styles.secondaryButton, { marginBottom: 15, flexDirection: 'row', justifyContent: 'center', gap: 10 }]}
                            onPress={() => navigation.navigate('SelectLocation', {
                                returnScreen: 'DoctorProfileSetup',
                                onSelect: (locationData: any) => {
                                    // Pre-fill from map selection
                                    setTempLocation({
                                        ...tempLocation,
                                        lat: String(locationData.latitude),
                                        lng: String(locationData.longitude),
                                        name: locationData.address || ''
                                    });
                                }
                            })}
                        >
                            <Icon name="map-outline" size={20} color="#0047AB" />
                            <Text style={styles.secondaryButtonText}>Select on Map</Text>
                        </TouchableOpacity>

                        <ProfileInput
                            label="Clinic Name"
                            placeholder="e.g. City Hospital"
                            value={tempLocation.name}
                            onChangeText={(t: string) => setTempLocation({ ...tempLocation, name: t })}
                            icon="business-outline"
                        />
                        <ProfileInput
                            label="Phone Number"
                            placeholder="Clinic Phone"
                            value={tempLocation.phone}
                            onChangeText={(t: string) => setTempLocation({ ...tempLocation, phone: formatPhoneNumber(t) })}
                            keyboardType="phone-pad"
                            leftElement={
                                <View style={{
                                    backgroundColor: '#F1F5F9',
                                    height: '100%',
                                    paddingHorizontal: 16,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRightWidth: 1,
                                    borderRightColor: '#E0E0E0',
                                    marginRight: 0,
                                }}>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A1F3A' }}>+92</Text>
                                </View>
                            }
                        />
                    </>
                )}

                {/* Show coordinates if available */}
                {(tempLocation.lat && tempLocation.lng && !tempLocation.isOnline) ? (
                    <View style={[styles.cardItem, { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' }]}>
                        <Text style={{ color: '#2E7D32', fontWeight: '600' }}>Location Selected!</Text>
                        <Text style={{ fontSize: 12, color: '#666' }}>Lat: {tempLocation.lat}, Lng: {tempLocation.lng}</Text>
                    </View>
                ) : null}

                <TouchableOpacity style={styles.addButton} onPress={addLocation}>
                    <Text style={styles.addButtonText}>Add Location</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Consultation Fees</Text>
                <ProfileInput
                    label="Online Consultation Fee (PKR)"
                    placeholder="0"
                    value={profileData.fees.online}
                    onChangeText={(t: string) => setProfileData(prev => ({ ...prev, fees: { ...prev.fees, online: t } }))}
                    keyboardType="numeric"
                    icon="cash-outline"
                />
                <ProfileInput
                    label="In-Clinic Consultation Fee (PKR)"
                    placeholder="0"
                    value={profileData.fees.inclinic}
                    onChangeText={(t: string) => setProfileData(prev => ({ ...prev, fees: { ...prev.fees, inclinic: t } }))}
                    keyboardType="numeric"
                    icon="cash-outline"
                />
            </View>

            {/*             <View style={styles.formContainer}>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Consultation Time</Text>
                <ProfileInput
                    label="Time per Patient (Minutes)"
                    placeholder="15"
                    value={profileData.consultationTime}
                    onChangeText={(t: string) => updateProfile('consultationTime', t)}
                    keyboardType="numeric"
                    icon="time-outline"
                />
            </View> */}

        </View>
    );

    const addAvailability = () => {
        if (!tempAvailability.day) return Alert.alert('Error', 'Please select a day');
        if (!tempAvailability.startTime || !tempAvailability.endTime) return Alert.alert('Error', 'Start time and end time are required');
        if (tempAvailability.appointmentType === 'inclinic' && !tempAvailability.locationName) {
            return Alert.alert('Error', 'Location name is required for in-clinic appointments');
        }

        setProfileData(prev => ({ ...prev, availability: [...prev.availability, tempAvailability] }));

        // Show success message
        Alert.alert('Success', `Availability added for ${tempAvailability.day}!`);

        // Reset all fields for next entry
        setTempAvailability({ day: 'Monday', startTime: '', endTime: '', appointmentType: 'inclinic', locationName: '' });
    };

    const renderAvailability = () => (
        <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Set Availability</Text>

            {/* List Existing Availability Grouped or Flat */}
            {profileData.availability.map((slot, index) => (
                <View key={index} style={styles.cardItem}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.cardTitle}>{slot.day}</Text>
                        <TouchableOpacity onPress={() => {
                            const newAvail = [...profileData.availability];
                            newAvail.splice(index, 1);
                            updateProfile('availability', newAvail);
                        }}>
                            <Icon name="close-circle" size={20} color="#FF5B5B" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.cardSubtitle}>{slot.startTime} - {slot.endTime}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>{slot.appointmentType} @ {slot.locationName || 'Any'}</Text>
                </View>
            ))}

            <View style={styles.addItemContainer}>
                <Text style={styles.subTitle}>Add Availability Slot</Text>

                <ProfileDropdown
                    label="Day"
                    icon="calendar-outline"
                    value={tempAvailability.day}
                    placeholder="Select Day"
                    onPress={() => openModal('Select Day', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], tempAvailability.day, false, (val) => setTempAvailability({ ...tempAvailability, day: val as string }))}
                />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 5 }}>
                        <ProfileDropdown
                            label="Start Time"
                            icon="time-outline"
                            value={tempAvailability.startTime}
                            placeholder="Start"
                            onPress={() => openModal('Start Time', TIME_SLOTS, tempAvailability.startTime, false, (val) => setTempAvailability({ ...tempAvailability, startTime: val as string }))}
                        />
                    </View>
                    <View style={{ flex: 1, marginLeft: 5 }}>
                        <ProfileDropdown
                            label="End Time"
                            icon="time-outline"
                            value={tempAvailability.endTime}
                            placeholder="End"
                            onPress={() => openModal('End Time', TIME_SLOTS, tempAvailability.endTime, false, (val) => setTempAvailability({ ...tempAvailability, endTime: val as string }))}
                        />
                    </View>
                </View>

                <ProfileDropdown
                    label="Type"
                    icon="laptop-outline" // or medkit-outline
                    value={tempAvailability.appointmentType === 'online' ? 'Online' : 'In-Clinic'}
                    placeholder="Type"
                    onPress={() => openModal('Appointment Type', ['Online', 'In-Clinic'], tempAvailability.appointmentType === 'online' ? 'Online' : 'In-Clinic', false, (val) => setTempAvailability({ ...tempAvailability, appointmentType: (val as string).toLowerCase() as any }))}
                />


                {tempAvailability.appointmentType === 'inclinic' && (
                    <ProfileDropdown
                        label="Location"
                        icon="location-outline"
                        value={tempAvailability.locationName}
                        placeholder="Select Clinic"
                        onPress={() => {
                            const locNames = profileData.locations.map(l => l.name);
                            if (locNames.length === 0) return Alert.alert('Error', 'Add locations first');
                            openModal('Select Location', locNames, tempAvailability.locationName, false, (val) => setTempAvailability({ ...tempAvailability, locationName: val as string }))
                        }}
                    />
                )}

                <TouchableOpacity style={styles.addButton} onPress={addAvailability}>
                    <Text style={styles.addButtonText}>Add Slot</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderTabs()}

            <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {currentStep === 0 && renderPersonalInfo()}
                    {currentStep === 1 && renderEducation()}
                    {currentStep === 2 && renderLocations()}
                    {currentStep === 3 && renderAvailability()}

                    {/* Navigation Buttons - Updated to look better */}
                    <View style={styles.footer}>
                        {currentStep > 0 && (
                            <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
                                <Text style={styles.secondaryButtonText}>Back</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.primaryButton, loading && styles.disabledButton, currentStep === 0 && { flex: 1, marginLeft: 0 }]}
                            onPress={handleNext}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.primaryButtonText}>{currentStep === STEPS.length - 1 ? 'Save & Finish' : 'Next'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            <SelectionModal
                visible={modalConfig.visible}
                title={modalConfig.title}
                options={modalConfig.options}
                selectedValues={modalConfig.selectedValues}
                multiSelect={modalConfig.multiSelect}
                onSelect={modalConfig.onSelect}
                onClose={closeModal}
            />

            <GenderSelectionModal
                visible={genderModalVisible}
                selectedGender={profileData.gender}
                onSelect={(gender) => updateProfile('gender', gender)}
                onClose={() => setGenderModalVisible(false)}
            />
        </SafeAreaView>
    );
};

const styles = createResponsiveStyles({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },
    // --- Header Styles ---
    headerContainer: {
        backgroundColor: '#0047AB', // Deep Blue
        paddingBottom: 20,
        paddingTop: 10,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#0047AB',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    // --- Tab Styles ---
    tabContainer: {
        backgroundColor: '#FFF',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    tabContent: {
        paddingHorizontal: 10,
    },
    tabItem: {
        marginRight: 25,
        paddingBottom: 5,
    },
    tabItemActive: {
        borderBottomWidth: 3,
        borderBottomColor: '#0047AB',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
    },
    tabTextActive: {
        color: '#0047AB',
    },
    // --- Profile Input Styles ---
    profileInputContainer: {
        flexDirection: 'row',
        alignItems: 'center', // Align items to center vertically
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 12, // Reduced padding
        marginBottom: 12, // Reduced margin
        borderWidth: 1,
        borderColor: '#E0E0E0', // Lighter border
        // Shadow for card effect
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    profileInputIcon: {
        marginRight: 15,
        width: 24, // Fixed width for alignment
        alignItems: 'center',
    },
    profileInputContent: {
        flex: 1,
    },
    profileInputLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    profileInput: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        padding: 0, // Remove default padding
    },
    // --- General Styles ---
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    formContainer: {
        marginTop: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        gap: 15,
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#0047AB',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 3,
    },
    primaryButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#0047AB',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#0047AB',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
    // --- Existing Styles Recycled ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalOptionSelected: {
        backgroundColor: '#F5F8FF',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    modalOptionTextSelected: {
        color: '#5B7FFF',
        fontWeight: '600',
    },
    modalConfirmButton: {
        marginTop: 15,
        backgroundColor: '#5B7FFF',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalConfirmButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'transparent', // Hide the old title as we have a header now, or keep it small
        height: 1, // Minimize it
    },
    chipScroll: {
        paddingVertical: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    chipActive: {
        backgroundColor: '#0047AB',
        borderColor: '#0047AB',
    },
    chipText: {
        color: '#666',
        fontWeight: '500',
    },
    chipTextActive: {
        color: '#FFF',
    },
    cardItem: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
        color: '#333',
    },
    cardSubtitle: {
        color: '#666',
        fontSize: 14,
        marginBottom: 8,
    },
    deleteText: {
        color: '#FF5B5B',
        fontWeight: '500',
    },
    addItemContainer: {
        backgroundColor: '#F9F9F9',
        padding: 15,
        borderRadius: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#CCC',
    },
    subTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    selectButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 14,
        marginBottom: 12,
    },
    selectButtonText: {
        color: '#333',
        fontSize: 15,
    },
    selectButtonPlaceholder: {
        color: '#999',
        fontSize: 15,
    },
    countryCodeContainer: {
        marginRight: 8,
    },
    countryCodeText: {
        fontSize: 16,
        color: '#333',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
        marginTop: 10,
    },
    pickerContainer: {
        marginBottom: 15,
    },
    errorText: {
        color: '#FF5B5B',
        fontSize: 12,
        marginTop: 4,
    },
    addButton: {
        backgroundColor: '#0047AB',
        paddingVertical: 8,
        paddingHorizontal: 32,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
        alignSelf: 'center',
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    // --- Gender Modal Styles ---
    genderModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    genderModalContent: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    genderModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    genderModalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1F3A',
        letterSpacing: 0.5,
    },
    genderCloseButton: {
        padding: 4,
    },
    genderCardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    genderCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 10,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F3F4F6',
        position: 'relative',
    },
    genderCardSelected: {
        backgroundColor: '#FFF',
    },
    genderIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    genderCardText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    genderCheckmark: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DoctorProfileSetupScreen;
