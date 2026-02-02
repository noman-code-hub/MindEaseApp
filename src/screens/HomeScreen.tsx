import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Modal,
    Alert,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { searchDoctors, Doctor, getSpecialities, Speciality, getCities, getMajorCities, getDoctorAvailability } from '../services/doctorService';
import { bookAppointment } from '../services/appointmentService';
import DoctorProfileModal from '../components/DoctorProfileModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Review {
    id: number;
    text: string;
    author: string;
    role: string;
    rating: number;
}

const REVIEWS_DATA: Review[] = [
    { id: 1, text: "Expert care that truly understands the nuances of modern stress.", author: "Anna Stevenson", role: "Verified Patient", rating: 5 },
    { id: 2, text: "The video consultation was seamless. Highly recommend Dr. Chen!", author: "Mark D.", role: "Verified Patient", rating: 5 },
    { id: 3, text: "Quick response for emergency support. Very helpful service.", author: "Sarah L.", role: "Verified Patient", rating: 4 },
];

const DEPARTMENTS = ["Clinical Psychology", "Psychiatry", "Therapy", "Emergency Care"];


// Reusable Animated Card Component
const AnimatedCard = ({ children, index, style, onPress }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 150, // Staggered delay
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 6,
                tension: 40,
                delay: index * 150,
                useNativeDriver: true,
            }),
        ]).start();
    }, [index]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

    if (onPress) {
        return (
            <AnimatedTouchable
                style={[
                    style,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ]
                    }
                ]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1} // Handled by scale
            >
                {children}
            </AnimatedTouchable>
        );
    }

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            {children}
        </Animated.View>
    );
};

const HomeScreen = () => {
    const insets = useSafeAreaInsets();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [patientId, setPatientId] = useState<string | null>(null); // To store logged in patient ID
    const [modalVisible, setModalVisible] = useState(false);

    // Dynamic Data State
    const [topSpecialists, setTopSpecialists] = useState<Doctor[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]); // For the dropdown
    const [loading, setLoading] = useState(false);
    const [specialities, setSpecialities] = useState<Speciality[]>([]);
    const [selectedSpeciality, setSelectedSpeciality] = useState<string | null>(null);

    // Booking State
    const [bookingType, setBookingType] = useState<'specialist' | 'service'>('service');
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedDate, setSelectedDate] = useState<string | null>(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null); // New field for in-clinic booking
    const [availabilitySlots, setAvailabilitySlots] = useState<{ morning: any[], afternoon: any[], evening: any[] }>({ morning: [], afternoon: [], evening: [] });
    const [isFetchingSlots, setIsFetchingSlots] = useState(false);
    const [bookingReason, setBookingReason] = useState(''); // New field for reason
    const [appointmentTypeFilter, setAppointmentTypeFilter] = useState<'online' | 'physical' | null>(null); // New filter state

    // Dropdown UI State
    const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
    const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);

    // Profile Modal State
    const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

    // Drawer State
    const [drawerVisible, setDrawerVisible] = useState(false);
    // ... rest of drawer

    // ... (Drawer Items)

    // Handlers
    const handleProfilePress = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsProfileModalVisible(true);
    };

    const handleBookFromProfile = () => {
        setIsProfileModalVisible(false);
        setBookingType('specialist');
        setSelectedDepartment(selectedDoctor?.role || '');
        setModalVisible(true);
    };

    const handleDetailView = () => {
        setIsProfileModalVisible(false);
        Alert.alert(
            "Doctor Details",
            `Name: Dr. ${selectedDoctor?.name}\nSpecialization: ${selectedDoctor?.specialization || selectedDoctor?.role}\nExperience: ${selectedDoctor?.experience || '5+'} Years\nClinic: ${selectedDoctor?.clinicName || 'MindEase Clinic'}\n\n[Full Profile Screen would go here]`
        );
        // Navigation to a dedicated DetailScreen can be added here
    };
    const { width } = Dimensions.get('window');
    const slideAnim = useRef(new Animated.Value(-width)).current; // Start off-screen LEFT
    const bgFadeAnim = useRef(new Animated.Value(0)).current;

    // Drawer Item Animations
    const item1Anim = useRef(new Animated.Value(50)).current; const item1Op = useRef(new Animated.Value(0)).current;
    const item2Anim = useRef(new Animated.Value(50)).current; const item2Op = useRef(new Animated.Value(0)).current;
    const item3Anim = useRef(new Animated.Value(50)).current; const item3Op = useRef(new Animated.Value(0)).current;
    const item4Anim = useRef(new Animated.Value(50)).current; const item4Op = useRef(new Animated.Value(0)).current;
    const item5Anim = useRef(new Animated.Value(50)).current; const item5Op = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (drawerVisible) {
            // Reset items
            [item1Anim, item2Anim, item3Anim, item4Anim, item5Anim].forEach(anim => anim.setValue(50));
            [item1Op, item2Op, item3Op, item4Op, item5Op].forEach(op => op.setValue(0));

            Animated.sequence([
                Animated.parallel([
                    Animated.timing(bgFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
                ]),
                Animated.stagger(50, [
                    Animated.parallel([Animated.spring(item1Anim, { toValue: 0, useNativeDriver: true }), Animated.timing(item1Op, { toValue: 1, duration: 200, useNativeDriver: true })]),
                    Animated.parallel([Animated.spring(item2Anim, { toValue: 0, useNativeDriver: true }), Animated.timing(item2Op, { toValue: 1, duration: 200, useNativeDriver: true })]),
                    Animated.parallel([Animated.spring(item3Anim, { toValue: 0, useNativeDriver: true }), Animated.timing(item3Op, { toValue: 1, duration: 200, useNativeDriver: true })]),
                    Animated.parallel([Animated.spring(item4Anim, { toValue: 0, useNativeDriver: true }), Animated.timing(item4Op, { toValue: 1, duration: 200, useNativeDriver: true })]),
                    Animated.parallel([Animated.spring(item5Anim, { toValue: 0, useNativeDriver: true }), Animated.timing(item5Op, { toValue: 1, duration: 200, useNativeDriver: true })]),
                ])
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: -width, duration: 250, useNativeDriver: true }),
                Animated.timing(bgFadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
            ]).start();
        }
    }, [drawerVisible]);

    const closeDrawer = (callback?: () => void) => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: -width, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.exp) }),
            Animated.timing(bgFadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => {
            setDrawerVisible(false);
            if (callback) callback();
        });
    };

    const handleDrawerNav = (screen: string, params?: any) => {
        closeDrawer(() => navigation.navigate(screen as never, params as never));
    };

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(['token', 'userId', 'role', 'doctorId', 'whatsappnumber']);
        setIsLoggedIn(false);
        closeDrawer(() => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            } as any);
        });
    };

    // Patient Form State
    const [patientName, setPatientName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [patientEmail, setPatientEmail] = useState('');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    // Feedback State
    const [reviews, setReviews] = useState<Review[]>(REVIEWS_DATA);
    const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackText, setFeedbackText] = useState('');

    const navigation = useNavigation<any>();

    // Location State
    const [selectedLocation, setSelectedLocation] = useState('All Pakistan');
    const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
    const [cities, setCities] = useState<string[]>([]);
    const [majorCities, setMajorCities] = useState<string[]>([]);
    const [isCityModalVisible, setIsCityModalVisible] = useState(false);
    const [citySearchQuery, setCitySearchQuery] = useState('');

    // Auto-suggest State
    const [suggestedDoctors, setSuggestedDoctors] = useState<Doctor[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Fetch Top Specialists & Patient Info on Mount
    useEffect(() => {
        const init = async () => {
            // 1. Fetch Top Specialists
            try {
                const doctors = await searchDoctors({}); // Fetch all/search to get a list
                console.log(`[DEBUG] Initial Top Specialists Fetch: Found ${doctors.length} doctors`);
                if (doctors.length > 0) {
                    console.log(`[DEBUG] Top Specialist Sample: ${doctors[0].name} (ID: ${doctors[0].doctorId})`);
                }
                // Take first 5 as "Top Specialists" for now
                setTopSpecialists(doctors.slice(0, 5));
            } catch (err) {
                console.error("Failed to fetch top specialists", err);
            }

            // 2. Fetch Specialities
            try {
                const specs = await getSpecialities();
                console.log(`[DEBUG] Fetched ${specs.length} specialities`);
                setSpecialities(specs);
            } catch (err) {
                console.error("Failed to fetch specialities", err);
            }

            // 3. Fetch Cities
            try {
                const citiesList = await getCities();
                console.log(`[DEBUG] Fetched ${citiesList.length} cities`);
                setCities(citiesList);
                setMajorCities(getMajorCities());
            } catch (err) {
                console.error("Failed to fetch cities", err);
            }

            // 4. Check Login
            const token = await AsyncStorage.getItem('token');
            setIsLoggedIn(!!token);
        };
        init();
    }, [drawerVisible]);

    // Refetch doctors when city changes
    useEffect(() => {
        const fetchDoctorsByCity = async () => {
            try {
                setLoading(true);
                const cityParam = selectedLocation === 'All Pakistan' ? undefined : selectedLocation;
                const doctors = await searchDoctors({ city: cityParam });
                console.log(`[DEBUG] Fetched ${doctors.length} doctors for city: ${selectedLocation}`);
                setTopSpecialists(doctors.slice(0, 5));
            } catch (err) {
                console.error("Failed to fetch doctors by city", err);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if cities have been loaded (to avoid initial double fetch)
        if (cities.length > 0) {
            fetchDoctorsByCity();
        }
    }, [selectedLocation, cities.length]);

    // Auto-suggest search with debouncing
    useEffect(() => {
        const performSearch = async () => {
            if (searchQuery.trim().length >= 3) {
                setIsSearching(true);
                setShowSuggestions(true);
                try {
                    const results = await searchDoctors({
                        search: searchQuery,
                        city: selectedLocation === 'All Pakistan' ? undefined : selectedLocation
                    });
                    console.log(`[DEBUG] Auto-suggest found ${results.length} doctors for query: "${searchQuery}"`);
                    setSuggestedDoctors(results.slice(0, 5)); // Show top 5 suggestions
                } catch (err) {
                    console.error('Auto-suggest search failed:', err);
                    setSuggestedDoctors([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSuggestedDoctors([]);
                setShowSuggestions(false);
            }
        };

        // Debounce the search
        const timeoutId = setTimeout(performSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, selectedLocation]);

    // Handlers
    const handleSpecialistBookPress = async (doctor: Doctor, type: 'online' | 'physical') => {
        setBookingType('specialist');
        setSelectedDoctor(doctor);
        setSelectedDepartment(doctor.role);
        setAppointmentTypeFilter(type);
        setModalVisible(true);
        // setSelectedDate(null); // Keep today's date
        setSelectedTime(null);
        setBookingReason('');
        setAvailabilitySlots({ morning: [], afternoon: [], evening: [] });

        // Fetch fresh availability
        try {
            const freshAvailability = await getDoctorAvailability(doctor.doctorId, selectedDate || new Date().toISOString().split('T')[0]);
            if (freshAvailability) {
                if (freshAvailability.morning || freshAvailability.afternoon || freshAvailability.evening) {
                    setAvailabilitySlots(freshAvailability);
                } else if (Array.isArray(freshAvailability) && freshAvailability.length > 0) {
                    setSelectedDoctor(prev => prev ? { ...prev, availability: freshAvailability } : null);
                }
            }
        } catch (err) {
            console.error('Failed to fetch fresh availability:', err);
        }
    };

    useEffect(() => {
        const fetchSlots = async () => {
            if (modalVisible && selectedDoctor && selectedDate) {
                setIsFetchingSlots(true);
                try {
                    const data = await getDoctorAvailability(selectedDoctor.doctorId, selectedDate);
                    if (data) {
                        if (data.morning || data.afternoon || data.evening) {
                            setAvailabilitySlots({
                                morning: data.morning || [],
                                afternoon: data.afternoon || [],
                                evening: data.evening || []
                            });
                        } else if (Array.isArray(data)) {
                            // If it returned an array for some reason, we should still handle it
                            // but our service is now updated to return categories
                        }
                    } else {
                        setAvailabilitySlots({ morning: [], afternoon: [], evening: [] });
                    }
                } catch (error) {
                    console.error('Error fetching granular slots:', error);
                    setAvailabilitySlots({ morning: [], afternoon: [], evening: [] });
                } finally {
                    setIsFetchingSlots(false);
                }
            }
        };

        fetchSlots();
    }, [modalVisible, selectedDoctor, selectedDate]);

    const handleServiceBookPress = async (serviceName: string) => {
        setBookingType('service');
        setSelectedDoctor(null);
        setModalVisible(true);
        setLoading(true);

        // Map service name to filters
        let currentTypeFilter = '';
        let targetDept = '';

        if (serviceName === 'Online Consultation') {
            currentTypeFilter = 'online';
            targetDept = 'Clinical Psychology'; // Default or leave empty
        } else if (serviceName === 'In-Clinic Visit') {
            currentTypeFilter = 'physical'; // Backend usually uses 'physical' or 'in-clinic'
        } else if (serviceName === 'Psychiatric Clinic') {
            targetDept = 'Psychiatry';
            currentTypeFilter = 'physical';
        }

        setSelectedDepartment(targetDept);
        setAppointmentTypeFilter(currentTypeFilter as any);

        // Fetch doctors and filter by availability/type
        try {
            const allDoctors = await searchDoctors({}); // Or pass params if supported
            console.log(`[DEBUG] Fetched ${allDoctors.length} doctors total.`);

            if (allDoctors.length > 0) {
                console.log(`[DEBUG] First doctor availability sample:`, JSON.stringify(allDoctors[0].availability));
            }

            // Filter doctors who have the required appointment type in their availability
            const filtered = allDoctors.filter(doc => {
                if (!doc.availability || doc.availability.length === 0) {
                    console.log(`[DEBUG] Doctor ${doc.name} has no availability.`);
                    return false;
                }

                // If we are looking for specific type, check availability
                if (currentTypeFilter) {
                    const hasType = doc.availability.some(slot => {
                        const slotType = slot.appointmentType ? slot.appointmentType.toLowerCase() : '';
                        // Check for various possible backend values
                        const isMatch = slotType === currentTypeFilter.toLowerCase() ||
                            (currentTypeFilter === 'physical' && (slotType === 'in-clinic' || slotType === 'inclinic' || slotType === 'physical')) ||
                            (currentTypeFilter === 'online' && slotType === 'online');
                        return isMatch;
                    });

                    if (!hasType) {
                        console.log(`[DEBUG] Doctor ${doc.name} filtered out. Type filter: ${currentTypeFilter}. Doc available: ${JSON.stringify(doc.availability)}`);
                    }
                    return hasType;
                }
                return true;
            });

            console.log(`[DEBUG] Found ${filtered.length} doctors for ${serviceName} after filtering.`);
            setFilteredDoctors(filtered);

        } catch (err) {
            console.error("Error fetching doctors for booking", err);
            Alert.alert("Error", "Could not load doctors. Please check your connection.");
        } finally {
            setLoading(false);
        }

        // Reset
        // setSelectedDate(null);
        setSelectedTime(null);
        setBookingReason('');
    };

    const handleScheduleAppointment = async () => {
        // Validation
        if (!selectedDoctor) {
            Alert.alert("Missing Info", "Please select a Doctor.");
            return;
        }
        if (!selectedDate || !selectedTime) {
            Alert.alert("Missing Info", "Please select a Date and Time.");
            return;
        }
        if (!patientName.trim() || !whatsappNumber.trim()) {
            Alert.alert("Missing Info", "Please provide patient name and phone.");
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const userId = await AsyncStorage.getItem('userId');
            const isClinic = (appointmentTypeFilter || 'online') === 'physical';
            const finalAppointmentType = isClinic ? 'inclinic' : 'online';

            let bookingPayload: any = {
                doctorId: selectedDoctor.doctorId,
                date: selectedDate,
                timeSlot: selectedTime,
                appointmentType: finalAppointmentType,
                reason: bookingReason || "General Consultation",
                patientName: patientName.trim(),
                patientPhone: whatsappNumber.trim(),
            };

            // Calculate amount based on doctor's fees or default to 500
            const amountStr = isClinic
                ? (selectedDoctor.fees?.inclinic || '500')
                : (selectedDoctor.fees?.online || '500');
            const amount = parseInt(String(amountStr)) || 500;

            // Only add locationId if it's a clinic visit
            if (isClinic && selectedLocationId) {
                bookingPayload.locationId = selectedLocationId;
            }

            // Close modal and navigate to Payment screen
            setModalVisible(false);

            // Pass the payload, token, userId, and amount to Payment screen
            navigation.navigate('Payment' as any, {
                bookingPayload,
                token,
                userId: userId || '',
                amount
            } as any);

            // Cleanup local state
            setPatientName('');
            setWhatsappNumber('');
            setPatientEmail('');
            setBookingReason('');
            setSelectedTime(null);

        } catch (err: any) {
            console.error("Booking prep error:", err);
            Alert.alert("Error", "Failed to prepare booking. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFeedback = () => {
        if (!feedbackText.trim()) {
            Alert.alert("Error", "Please enter your feedback.");
            return;
        }
        const newReview: Review = {
            id: reviews.length + 1,
            text: feedbackText,
            author: isLoggedIn ? "User" : "Guest",
            role: "New Patient",
            rating: feedbackRating
        };
        setReviews([newReview, ...reviews]);
        setFeedbackModalVisible(false);
        setFeedbackText('');
        setFeedbackRating(5);
        Alert.alert("Thank You", "Your feedback has been submitted!");
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* Fixed Top Bar Area */}
            <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>

                {/* Brand Row - Hamburger & Title */}
                <View style={styles.brandRow}>
                    <TouchableOpacity onPress={() => setDrawerVisible(true)}>
                        <Icon name="menu" size={24} color="#1A1F3A" />
                    </TouchableOpacity>
                    <Text style={styles.brandTitle}>MindEase</Text>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={styles.iconButton}>
                        <Icon name="notifications-outline" size={24} color="#1A1F3A" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                </View>

                {/* Location Row */}
                <View style={styles.locationRow}>
                    <View>
                        <Text style={styles.locationLabel}>Location</Text>
                        <TouchableOpacity
                            style={styles.locationSelector}
                            onPress={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                        >
                            <Icon name="location" size={16} color="#2D5BFF" />
                            <Text style={styles.locationText}>{selectedLocation}</Text>
                            <Icon name="chevron-down" size={14} color="#333" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Location Dropdown Selection */}
                {isLocationDropdownOpen && (
                    <View style={[styles.locationDropdown, { top: insets.top + 110 }]}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                        >
                            <TouchableOpacity
                                style={styles.locationOption}
                                onPress={() => { setSelectedLocation('All Pakistan'); setIsLocationDropdownOpen(false); }}
                            >
                                <Icon name="globe-outline" size={18} color="#2D5BFF" style={{ marginRight: 8 }} />
                                <Text style={styles.locationOptionText}>All Pakistan</Text>
                            </TouchableOpacity>
                            {majorCities.map((city, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.locationOption}
                                    onPress={() => { setSelectedLocation(city); setIsLocationDropdownOpen(false); }}
                                >
                                    <Icon name="location-outline" size={18} color="#666" style={{ marginRight: 8 }} />
                                    <Text style={styles.locationOptionText}>{city}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={styles.viewAllCitiesButton}
                                onPress={() => { setIsCityModalVisible(true); setIsLocationDropdownOpen(false); }}
                            >
                                <Icon name="ellipsis-horizontal-circle" size={20} color="#2D5BFF" style={{ marginRight: 8 }} />
                                <Text style={styles.viewAllCitiesText}>More</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}

                {/* Search Row */}
                <View style={styles.searchRow}>
                    <View style={styles.searchBar}>
                        <Icon name="search-outline" size={22} color="#999" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search doctors, specialists..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            returnKeyType="search"
                            onSubmitEditing={() => {
                                if (searchQuery.length === 0 || searchQuery.length >= 3) {
                                    setShowSuggestions(false);
                                    navigation.navigate('AllSpecialists', { initialQuery: searchQuery } as never);
                                }
                            }}
                            onFocus={() => {
                                if (searchQuery.length >= 3) {
                                    setShowSuggestions(true);
                                }
                            }}
                        />
                        {searchQuery.length > 0 && searchQuery.length < 3 && (
                            <Text style={styles.searchHelperText}>Min 3 chars</Text>
                        )}
                        {isSearching && (
                            <ActivityIndicator size="small" color="#2D5BFF" />
                        )}
                    </View>

                </View>

                {/* Auto-suggest Dropdown */}
                {showSuggestions && suggestedDoctors.length > 0 && (
                    <View style={styles.suggestionsDropdown}>
                        <ScrollView
                            style={styles.suggestionsScrollView}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled={true}
                        >
                            {suggestedDoctors.map((doctor, index) => (
                                <TouchableOpacity
                                    key={doctor.doctorId || index}
                                    style={styles.suggestionItem}
                                    onPress={() => {
                                        setShowSuggestions(false);
                                        setSelectedDoctor(doctor);
                                        setIsProfileModalVisible(true);
                                    }}
                                >
                                    <View style={[styles.suggestionAvatar, { backgroundColor: doctor.color || '#2D5BFF' }]}>
                                        <Text style={styles.suggestionAvatarText}>
                                            {doctor.name?.charAt(0) || 'D'}
                                        </Text>
                                    </View>
                                    <View style={styles.suggestionInfo}>
                                        <Text style={styles.suggestionName}>{doctor.name}</Text>
                                        <Text style={styles.suggestionSpecialty}>
                                            {doctor.speciality || doctor.role}
                                        </Text>
                                        {doctor.city && (
                                            <Text style={styles.suggestionCity}>
                                                <Icon name="location-outline" size={12} color="#999" /> {doctor.city}
                                            </Text>
                                        )}
                                    </View>
                                    <Icon name="chevron-forward" size={20} color="#999" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Specialities Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.specialitiesContainer}
                    contentContainerStyle={styles.specialitiesContent}
                >
                    {specialities.map((spec, index) => {
                        const isSelected = selectedSpeciality === spec._id;

                        // Icon mapping helper
                        const getSpecialityIcon = (name: string) => {
                            const n = name.toLowerCase();
                            if (n.includes('heart') || n.includes('cardio')) return 'heart-outline';
                            if (n.includes('tooth') || n.includes('dent')) return 'happy-outline'; // using happy as proxy for now
                            if (n.includes('eye') || n.includes('opht')) return 'eye-outline';
                            if (n.includes('skin') || n.includes('derm')) return 'body-outline';
                            if (n.includes('bone') || n.includes('ortho')) return 'walk-outline';
                            if (n.includes('brain') || n.includes('psych')) return 'headset-outline';
                            if (n.includes('child') || n.includes('pedi')) return 'balloon-outline';
                            if (n.includes('women') || n.includes('gyn')) return 'flower-outline';
                            return 'pulse-outline'; // default
                        };

                        const iconName = getSpecialityIcon(spec.speciality);

                        return (
                            <TouchableOpacity
                                key={spec._id || index}
                                style={[styles.specialityChip, isSelected && styles.specialityChipSelected]}
                                onPress={() => {
                                    // Navigate to AllSpecialistsScreen with specialityId filter
                                    navigation.navigate('AllSpecialists', {
                                        specialityId: spec._id
                                    } as never);
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.specialityIconContainer, isSelected && styles.specialityIconContainerSelected]}>
                                    <Icon
                                        name={iconName}
                                        size={20}
                                        color={isSelected ? "#FFF" : "#5B7FFF"}
                                    />
                                </View>
                                <Text style={[styles.specialityChipText, isSelected && styles.specialityChipTextSelected]}>
                                    {spec.speciality}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                    <TouchableOpacity
                        style={styles.viewAllChip}
                        onPress={() => navigation.navigate('AllSpecialists' as never)}
                    >
                        <Text style={styles.viewAllChipText}>View All</Text>
                        <Icon name="chevron-forward" size={16} color="#666" />
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>


                {/* Hero Card */}
                <View style={styles.heroCard}>
                    <Text style={styles.heroTitle}>Focus on your{'\n'}mental clarity.</Text>
                    <TouchableOpacity style={styles.heroButton}>
                        <Text style={styles.heroButtonText}>New Plans Available</Text>
                    </TouchableOpacity>
                </View>

                {/* Service Cards */}
                <View style={styles.servicesGrid}>
                    {/* Online Consultation */}
                    <AnimatedCard index={0} style={[styles.serviceCard, styles.blueCard]}>
                        <View style={styles.serviceIconContainer}>
                            <Icon name="videocam" size={24} color="#5B7FFF" />
                        </View>
                        <Text style={styles.serviceTitle}>Online{'\n'}Consultation</Text>
                        <View style={styles.serviceFooter}>
                            <Text style={styles.serviceSubtitle}>HD VIDEO CALL</Text>
                            <TouchableOpacity style={styles.bookButton} onPress={() => handleServiceBookPress('Online Consultation')}>
                                <Text style={styles.bookButtonText}>BOOK</Text>
                            </TouchableOpacity>
                        </View>
                    </AnimatedCard>

                    {/* In-Clinic Visit */}
                    <AnimatedCard index={1} style={[styles.serviceCard, styles.greenCard]}>
                        <View style={styles.serviceIconContainer}>
                            <Icon name="medkit" size={24} color="#4ECDC4" />
                        </View>
                        <Text style={styles.serviceTitle}>In-Clinic{'\n'}Visit</Text>
                        <View style={styles.serviceFooter}>
                            <Text style={styles.serviceSubtitle}>PHYSICAL CARE</Text>
                            <TouchableOpacity style={styles.bookButton} onPress={() => handleServiceBookPress('In-Clinic Visit')}>
                                <Text style={styles.bookButtonText}>BOOK</Text>
                            </TouchableOpacity>
                        </View>
                    </AnimatedCard>

                    {/* Emergency Support */}
                    <AnimatedCard index={2} style={[styles.serviceCard, styles.orangeCard]}>
                        <View style={styles.serviceIconContainer}>
                            <Icon name="alert-circle" size={24} color="#FF6B9D" />
                        </View>
                        <Text style={styles.serviceTitle}>EMERGENCY{'\n'}SUPPORT</Text>
                        <View style={styles.serviceFooter}>
                            <Text style={styles.serviceSubtitle}>ACTIVE 24/7</Text>
                            <TouchableOpacity style={[styles.bookButton, styles.urgentButton]} onPress={() => handleServiceBookPress('Emergency Support')}>
                                <Text style={styles.bookButtonText}>URGENT</Text>
                            </TouchableOpacity>
                        </View>
                    </AnimatedCard>

                    {/* Psychiatric Clinic */}
                    <AnimatedCard index={3} style={[styles.serviceCard, styles.purpleCard]}>
                        <View style={styles.serviceIconContainer}>
                            <Icon name="clipboard" size={24} color="#A78BFA" />
                        </View>
                        <Text style={styles.serviceTitle}>Psychiatric{'\n'}Clinic</Text>
                        <View style={styles.serviceFooter}>
                            <Text style={styles.serviceSubtitle}>SPECIALIZED</Text>
                            <TouchableOpacity style={styles.bookButton} onPress={() => handleServiceBookPress('Psychiatric Clinic')}>
                                <Text style={styles.bookButtonText}>VIEW</Text>
                            </TouchableOpacity>
                        </View>
                    </AnimatedCard>
                </View>

                {/* Top Specialists Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Top Specialists</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AllSpecialists' as never)}>
                        <Text style={styles.seeAllText}>SEE ALL</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.specialistsList}
                    snapToInterval={166} // Card width (150) + margin (16)
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingRight: 16 }}
                >
                    {loading ? (
                        <View style={{ marginLeft: 20, paddingVertical: 40 }}>
                            <ActivityIndicator size="large" color="#5B7FFF" />
                        </View>
                    ) : topSpecialists.length > 0 ? (
                        topSpecialists.map((specialist, index) => (
                            <AnimatedCard
                                key={specialist.doctorId}
                                index={index}
                                style={styles.specialistCard}
                                onPress={() => handleProfilePress(specialist)}
                            >
                                <TouchableOpacity onPress={() => handleProfilePress(specialist)} style={styles.doctorImageContainer}>
                                    <Icon name="person-circle" size={50} color={specialist.color || '#5B7FFF'} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleProfilePress(specialist)}>
                                    <Text style={styles.doctorName} numberOfLines={1}>{specialist.name}</Text>
                                </TouchableOpacity>
                                <View style={styles.ratingContainer}>
                                    <Icon name="star" size={12} color="#FFD700" />
                                    <Text style={styles.ratingText}>{specialist.rating || 'New'} • {specialist.role}</Text>
                                </View>
                                <View style={styles.cardActionContainer}>
                                    <TouchableOpacity
                                        style={[styles.cardBookButton, styles.onlineBtn]}
                                        onPress={() => handleSpecialistBookPress(specialist, 'online')}
                                    >
                                        <Text style={styles.cardBookButtonText}>Online Book</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.cardBookButton, styles.clinicBtn]}
                                        onPress={() => handleSpecialistBookPress(specialist, 'physical')}
                                    >
                                        <Text style={[styles.cardBookButtonText, styles.clinicBtnText]}>In-Clinic Book</Text>
                                    </TouchableOpacity>
                                </View>
                            </AnimatedCard>
                        ))
                    ) : (
                        <View style={{ marginLeft: 20, paddingVertical: 20 }}>
                            <Text style={{ color: '#999', fontSize: 14 }}>
                                No specialists found in {selectedLocation}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setSelectedLocation('All Pakistan')}
                                style={{ marginTop: 8 }}
                            >
                                <Text style={{ color: '#5B7FFF', fontSize: 14, fontWeight: '600' }}>
                                    View all cities
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                {/* Doctor Profile Modal */}
                <DoctorProfileModal
                    visible={isProfileModalVisible}
                    onClose={() => setIsProfileModalVisible(false)}
                    doctor={selectedDoctor}
                    onBookType={(type) => {
                        setIsProfileModalVisible(false); // Close profile
                        if (selectedDoctor) {
                            handleSpecialistBookPress(selectedDoctor, type);
                        }
                    }}
                    onDetail={handleDetailView}
                />

                {/* Feedback Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Community Feedback</Text>
                    <TouchableOpacity onPress={() => setFeedbackModalVisible(true)}>
                        <Text style={styles.seeAllText}>WRITE REVIEW</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.specialistsList}
                    snapToInterval={300} // Card width + margin
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingRight: 16 }}
                >
                    {reviews.map((review) => (
                        <View key={review.id} style={styles.reviewCardItem}>
                            <View style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Icon key={star} name={star <= review.rating ? "star" : "star-outline"} size={14} color="#FFD700" />
                                ))}
                            </View>
                            <Text style={styles.reviewTextItem} numberOfLines={3}>
                                "{review.text}"
                            </Text>
                            <View style={styles.reviewAuthor}>
                                <View style={styles.authorAvatar}>
                                    <Text style={styles.avatarText}>{review.author.charAt(0)}</Text>
                                </View>
                                <View>
                                    <Text style={styles.authorName}>{review.author.toUpperCase()}</Text>
                                    <Text style={styles.authorLabel}>{review.role}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Feedback Modal */}
                <Modal
                    transparent={true}
                    visible={feedbackModalVisible}
                    animationType="fade"
                    onRequestClose={() => setFeedbackModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.feedbackModalContent}>
                            <Text style={styles.modalTitle}>Share Your Experience</Text>

                            <Text style={styles.fieldLabel}>Rate your experience</Text>
                            <View style={styles.ratingSelectContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => setFeedbackRating(star)}>
                                        <Icon
                                            name={star <= feedbackRating ? "star" : "star-outline"}
                                            size={32}
                                            color="#FFD700"
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.fieldLabel}>Your Feedback</Text>
                            <TextInput
                                style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
                                placeholder="Tell us about your experience..."
                                multiline
                                value={feedbackText}
                                onChangeText={setFeedbackText}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setFeedbackModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={handleSubmitFeedback}
                                >
                                    <Text style={styles.confirmButtonText}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* City Selection Modal */}
                <Modal
                    transparent={true}
                    visible={isCityModalVisible}
                    animationType="slide"
                    onRequestClose={() => setIsCityModalVisible(false)}
                >
                    <View style={styles.cityModalOverlay}>
                        <View style={styles.cityModalContent}>
                            {/* Header */}
                            <View style={styles.cityModalHeader}>
                                <Text style={styles.cityModalTitle}>Select City</Text>
                                <TouchableOpacity
                                    onPress={() => setIsCityModalVisible(false)}
                                    style={styles.cityModalCloseButton}
                                >
                                    <Icon name="close" size={24} color="#1A1F3A" />
                                </TouchableOpacity>
                            </View>

                            {/* Search Bar */}
                            <View style={styles.citySearchContainer}>
                                <Icon name="search-outline" size={20} color="#999" />
                                <TextInput
                                    style={styles.citySearchInput}
                                    placeholder="Search cities..."
                                    placeholderTextColor="#999"
                                    value={citySearchQuery}
                                    onChangeText={setCitySearchQuery}
                                />
                                {citySearchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setCitySearchQuery('')}>
                                        <Icon name="close-circle" size={20} color="#999" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Cities Grid */}
                            <ScrollView
                                style={styles.citiesScrollView}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.citiesGridContainer}
                            >
                                {/* All Pakistan Option */}
                                <TouchableOpacity
                                    style={[
                                        styles.cityCard,
                                        selectedLocation === 'All Pakistan' && styles.cityCardSelected
                                    ]}
                                    onPress={() => {
                                        setSelectedLocation('All Pakistan');
                                        setIsCityModalVisible(false);
                                        setCitySearchQuery('');
                                    }}
                                >
                                    <Icon
                                        name="globe"
                                        size={28}
                                        color={selectedLocation === 'All Pakistan' ? '#2D5BFF' : '#666'}
                                    />
                                    <Text
                                        style={[
                                            styles.cityCardText,
                                            selectedLocation === 'All Pakistan' && styles.cityCardTextSelected
                                        ]}
                                    >
                                        All Pakistan
                                    </Text>
                                </TouchableOpacity>

                                {/* Filtered Cities */}
                                {cities
                                    .filter(city =>
                                        city.toLowerCase().includes(citySearchQuery.toLowerCase())
                                    )
                                    .map((city, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.cityCard,
                                                selectedLocation === city && styles.cityCardSelected
                                            ]}
                                            onPress={() => {
                                                setSelectedLocation(city);
                                                setIsCityModalVisible(false);
                                                setCitySearchQuery('');
                                            }}
                                        >
                                            <Icon
                                                name="location"
                                                size={28}
                                                color={selectedLocation === city ? '#2D5BFF' : '#666'}
                                            />
                                            <Text
                                                style={[
                                                    styles.cityCardText,
                                                    selectedLocation === city && styles.cityCardTextSelected
                                                ]}
                                            >
                                                {city}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Advanced Booking Modal */}
                <Modal
                    transparent={true}
                    visible={modalVisible}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>Schedule Appointment</Text>

                            {/* 1. Calendar Section */}
                            <Text style={styles.sectionLabel}>Select Date</Text>
                            <View style={styles.calendarWrapper}>
                                <Calendar
                                    onDayPress={(day: { dateString: string }) => {
                                        setSelectedDate(day.dateString);
                                    }}
                                    markedDates={{
                                        [selectedDate || '']: {
                                            selected: true,
                                            disableTouchEvent: true,
                                            selectedColor: '#5B7FFF',
                                            selectedTextColor: '#FFFFFF'
                                        }
                                    }}
                                    theme={{
                                        backgroundColor: '#ffffff',
                                        calendarBackground: '#ffffff',
                                        textSectionTitleColor: '#b6c1cd',
                                        selectedDayBackgroundColor: '#5B7FFF',
                                        selectedDayTextColor: '#ffffff',
                                        todayTextColor: '#5B7FFF',
                                        dayTextColor: '#2d4150',
                                        textDisabledColor: '#d9e1e8',
                                        dotColor: '#00adf5',
                                        selectedDotColor: '#ffffff',
                                        arrowColor: '#5B7FFF',
                                        disabledArrowColor: '#d9e1e8',
                                        monthTextColor: '#1A1F3A',
                                        indicatorColor: '#5B7FFF',
                                        textDayFontFamily: 'System',
                                        textMonthFontFamily: 'System',
                                        textDayHeaderFontFamily: 'System',
                                        textDayFontWeight: '600',
                                        textMonthFontWeight: '700',
                                        textDayHeaderFontWeight: '600',
                                        textDayFontSize: 14,
                                        textMonthFontSize: 16,
                                        textDayHeaderFontSize: 12
                                    }}
                                    minDate={new Date().toISOString().split('T')[0]}
                                    enableSwipeMonths={true}
                                />
                            </View>

                            {/* 2. Doctor Selection (Filtered) */}
                            <View style={styles.dropdownRow}>
                                {/* Only show doctor dropdown if not booking a specific specialist */}
                                {bookingType === 'service' && (
                                    <View style={styles.dropdownContainer}>
                                        <Text style={styles.fieldLabel}>Select Doctor</Text>
                                        <TouchableOpacity
                                            style={styles.dropdownHeader}
                                            onPress={() => setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
                                        >
                                            <Text style={selectedDoctor ? styles.dropdownSelectedText : styles.dropdownPlaceholder}>
                                                {selectedDoctor?.name || (loading ? "Loading doctors..." : "Select Doctor")}
                                            </Text>
                                            <Icon name={isDoctorDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                                        </TouchableOpacity>

                                        {isDoctorDropdownOpen && (
                                            <View style={styles.dropdownListContainer}>
                                                <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                                                    {filteredDoctors.length > 0 ? (
                                                        filteredDoctors.map((doc, i) => (
                                                            <TouchableOpacity
                                                                key={i}
                                                                style={[styles.dropdownItem, selectedDoctor?.doctorId === doc.doctorId && styles.dropdownItemSelected]}
                                                                onPress={() => {
                                                                    setSelectedDoctor(doc);
                                                                    setIsDoctorDropdownOpen(false);
                                                                    // Fetch fresh availability when doctor is selected from dropdown
                                                                    getDoctorAvailability(doc.doctorId).then(freshAvailability => {
                                                                        if (freshAvailability && freshAvailability.length > 0) {
                                                                            setSelectedDoctor(prev => prev ? { ...prev, availability: freshAvailability } : null);
                                                                        }
                                                                    }).catch(err => console.error('Failed to fetch fresh availability:', err));
                                                                }}
                                                            >
                                                                <Text style={[styles.dropdownText, selectedDoctor?.doctorId === doc.doctorId && styles.dropdownTextSelected]}>
                                                                    {doc.name} - {doc.role}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        ))
                                                    ) : (
                                                        <Text style={styles.dropdownItem}>No doctors available</Text>
                                                    )}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {bookingType === 'specialist' && (
                                    <View style={styles.readOnlyField}>
                                        <View style={styles.dropdownContainer}>
                                            <Text style={styles.fieldLabel}>Doctor</Text>
                                            <Text style={styles.readOnlyText}>{selectedDoctor?.name}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* 3. Time Slots Section (Dynamic) */}
                            <Text style={styles.sectionLabel}>Available Slots</Text>

                            {isFetchingSlots ? (
                                <ActivityIndicator size="small" color="#5B7FFF" style={{ marginVertical: 20 }} />
                            ) : (
                                <>
                                    {/* Morning Slots */}
                                    {availabilitySlots.morning.filter(slot => {
                                        if (!appointmentTypeFilter) return true;
                                        const slotType = (slot.appointmentType || '').toLowerCase();
                                        const filter = appointmentTypeFilter.toLowerCase();
                                        if (!slotType) return true; // Show if type is missing
                                        if (filter === 'physical') {
                                            return slotType === 'in-clinic' || slotType === 'inclinic' || slotType === 'physical';
                                        }
                                        return slotType === filter;
                                    }).length > 0 && (
                                            <>
                                                <Text style={styles.slotCategoryLabel}>Morning</Text>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotsGrid}>
                                                    {availabilitySlots.morning.filter(slot => {
                                                        if (!appointmentTypeFilter) return true;
                                                        const slotType = (slot.appointmentType || '').toLowerCase();
                                                        const filter = appointmentTypeFilter.toLowerCase();
                                                        if (!slotType) return true;
                                                        if (filter === 'physical') {
                                                            return slotType === 'in-clinic' || slotType === 'inclinic' || slotType === 'physical';
                                                        }
                                                        return slotType === filter;
                                                    }).map((slot, index) => {
                                                        const isSelected = selectedTime === slot.time;
                                                        const isBooked = slot.isBooked;
                                                        return (
                                                            <TouchableOpacity
                                                                key={`morning-${index}`}
                                                                style={[
                                                                    styles.slotChip,
                                                                    isSelected && styles.slotChipSelected,
                                                                    isBooked && styles.slotChipDisabled
                                                                ]}
                                                                onPress={() => {
                                                                    if (!isBooked) {
                                                                        setSelectedTime(slot.time);
                                                                        setSelectedLocationId(slot.locationId || null);
                                                                    }
                                                                }}
                                                                disabled={isBooked}
                                                            >
                                                                <Text style={[
                                                                    styles.slotText,
                                                                    isSelected && styles.textSelected,
                                                                    isBooked && styles.slotTextDisabled
                                                                ]}>
                                                                    {slot.time}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </ScrollView>
                                            </>
                                        )}

                                    {availabilitySlots.afternoon.filter(slot => {
                                        if (!appointmentTypeFilter) return true;
                                        const slotType = (slot.appointmentType || '').toLowerCase();
                                        const filter = appointmentTypeFilter.toLowerCase();
                                        if (!slotType) return true;
                                        if (filter === 'physical') {
                                            return slotType === 'in-clinic' || slotType === 'inclinic' || slotType === 'physical';
                                        }
                                        return slotType === filter;
                                    }).length > 0 && (
                                            <>
                                                <Text style={styles.slotCategoryLabel}>Afternoon</Text>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotsGrid}>
                                                    {availabilitySlots.afternoon.filter(slot => {
                                                        if (!appointmentTypeFilter) return true;
                                                        const slotType = (slot.appointmentType || '').toLowerCase();
                                                        const filter = appointmentTypeFilter.toLowerCase();
                                                        if (!slotType) return true;
                                                        if (filter === 'physical') {
                                                            return slotType === 'in-clinic' || slotType === 'inclinic' || slotType === 'physical';
                                                        }
                                                        return slotType === filter;
                                                    }).map((slot, index) => {
                                                        const isSelected = selectedTime === slot.time;
                                                        const isBooked = slot.isBooked;
                                                        return (
                                                            <TouchableOpacity
                                                                key={`afternoon-${index}`}
                                                                style={[
                                                                    styles.slotChip,
                                                                    isSelected && styles.slotChipSelected,
                                                                    isBooked && styles.slotChipDisabled
                                                                ]}
                                                                onPress={() => {
                                                                    if (!isBooked) {
                                                                        setSelectedTime(slot.time);
                                                                        setSelectedLocationId(slot.locationId || null);
                                                                    }
                                                                }}
                                                                disabled={isBooked}
                                                            >
                                                                <Text style={[
                                                                    styles.slotText,
                                                                    isSelected && styles.textSelected,
                                                                    isBooked && styles.slotTextDisabled
                                                                ]}>
                                                                    {slot.time}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </ScrollView>
                                            </>
                                        )}

                                    {availabilitySlots.evening.filter(slot => {
                                        if (!appointmentTypeFilter) return true;
                                        const slotType = (slot.appointmentType || '').toLowerCase();
                                        const filter = appointmentTypeFilter.toLowerCase();
                                        if (!slotType) return true;
                                        if (filter === 'physical') {
                                            return slotType === 'in-clinic' || slotType === 'inclinic' || slotType === 'physical';
                                        }
                                        return slotType === filter;
                                    }).length > 0 && (
                                            <>
                                                <Text style={styles.slotCategoryLabel}>Evening</Text>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotsGrid}>
                                                    {availabilitySlots.evening.filter(slot => {
                                                        if (!appointmentTypeFilter) return true;
                                                        const slotType = (slot.appointmentType || '').toLowerCase();
                                                        const filter = appointmentTypeFilter.toLowerCase();
                                                        if (!slotType) return true;
                                                        if (filter === 'physical') {
                                                            return slotType === 'in-clinic' || slotType === 'inclinic' || slotType === 'physical';
                                                        }
                                                        return slotType === filter;
                                                    }).map((slot, index) => {
                                                        const isSelected = selectedTime === slot.time;
                                                        const isBooked = slot.isBooked;
                                                        return (
                                                            <TouchableOpacity
                                                                key={`evening-${index}`}
                                                                style={[
                                                                    styles.slotChip,
                                                                    isSelected && styles.slotChipSelected,
                                                                    isBooked && styles.slotChipDisabled
                                                                ]}
                                                                onPress={() => {
                                                                    if (!isBooked) {
                                                                        setSelectedTime(slot.time);
                                                                        setSelectedLocationId(slot.locationId || null);
                                                                    }
                                                                }}
                                                                disabled={isBooked}
                                                            >
                                                                <Text style={[
                                                                    styles.slotText,
                                                                    isSelected && styles.textSelected,
                                                                    isBooked && styles.slotTextDisabled
                                                                ]}>
                                                                    {slot.time}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </ScrollView>
                                            </>
                                        )}

                                    {availabilitySlots.morning.filter(s => !appointmentTypeFilter || !s.appointmentType || (appointmentTypeFilter === 'physical' ? (s.appointmentType === 'in-clinic' || s.appointmentType === 'inclinic' || s.appointmentType === 'physical') : s.appointmentType === appointmentTypeFilter)).length === 0 &&
                                        availabilitySlots.afternoon.filter(s => !appointmentTypeFilter || !s.appointmentType || (appointmentTypeFilter === 'physical' ? (s.appointmentType === 'in-clinic' || s.appointmentType === 'inclinic' || s.appointmentType === 'physical') : s.appointmentType === appointmentTypeFilter)).length === 0 &&
                                        availabilitySlots.evening.filter(s => !appointmentTypeFilter || !s.appointmentType || (appointmentTypeFilter === 'physical' ? (s.appointmentType === 'in-clinic' || s.appointmentType === 'inclinic' || s.appointmentType === 'physical') : s.appointmentType === appointmentTypeFilter)).length === 0 && (
                                            <Text style={styles.slotText}>No {appointmentTypeFilter || 'available'} slots for this date. Please select another date or doctor.</Text>
                                        )}
                                </>
                            )}

                            {/* 4. Patient Information */}
                            <Text style={styles.sectionLabel}>Patient Information</Text>
                            <View style={styles.inputContainer}>
                                <Text style={styles.fieldLabel}>Full Name</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Enter patient's full name"
                                    value={patientName}
                                    onChangeText={setPatientName}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.fieldLabel}>Phone Number / WhatsApp</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Enter phone number"
                                    keyboardType="phone-pad"
                                    value={whatsappNumber}
                                    onChangeText={setWhatsappNumber}
                                />
                            </View>

                            <View style={styles.inputContainer}>
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

                            {/* 5. Reason */}
                            <View style={{ marginTop: 16 }}>
                                <Text style={styles.fieldLabel}>Reason for Visit</Text>
                                <TextInput
                                    style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                                    placeholder="E.g., anxiety, checkup..."
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
                                    {loading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.confirmButtonText}>Book Appointment</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                            <View style={{ height: 20 }} />
                        </ScrollView>
                    </View>
                </Modal>

                {/* Bottom Padding */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Drawer Modal - Simplified */}
            {drawerVisible && (
                <Modal
                    transparent={true}
                    visible={drawerVisible}
                    animationType="slide"
                    onRequestClose={() => setDrawerVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity
                            style={styles.modalBackdrop}
                            onPress={() => setDrawerVisible(false)}
                            activeOpacity={1}
                        />
                        <View style={styles.drawerContent}>
                            <View style={styles.menuHeader}>
                                <Text style={styles.menuTitle}>Menu</Text>
                                <TouchableOpacity onPress={() => setDrawerVisible(false)}>
                                    <Icon name="close" size={24} color="#1A1F3A" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.menuItemsContainer}>
                                <TouchableOpacity
                                    style={styles.drawerItemTouch}
                                    onPress={() => {
                                        setDrawerVisible(false);
                                        navigation.navigate('Home' as never);
                                    }}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: '#E8EFFF' }]}>
                                        <Icon name="home" size={22} color="#5B7FFF" />
                                    </View>
                                    <Text style={styles.drawerItemText}>Home</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.drawerItemTouch}
                                    onPress={() => {
                                        setDrawerVisible(false);
                                        navigation.navigate('Profile' as never);
                                    }}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: '#E8EFFF' }]}>
                                        <Icon name="person" size={22} color="#5B7FFF" />
                                    </View>
                                    <Text style={styles.drawerItemText}>Profile</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.drawerItemTouch}
                                    onPress={() => {
                                        setDrawerVisible(false);
                                        navigation.navigate('Appointment' as never);
                                    }}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: '#E0F7F5' }]}>
                                        <Icon name="calendar" size={22} color="#4ECDC4" />
                                    </View>
                                    <Text style={styles.drawerItemText}>Appointments</Text>
                                </TouchableOpacity>

                                {!isLoggedIn ? (
                                    <>
                                        <TouchableOpacity
                                            style={styles.drawerItemTouch}
                                            onPress={() => {
                                                setDrawerVisible(false);
                                                navigation.navigate('Signup' as never, { role: 'doctor' } as never);
                                            }}
                                        >
                                            <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                                                <Icon name="medical" size={22} color="#5B7FFF" />
                                            </View>
                                            <Text style={styles.drawerItemText}>Join as Doctor</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.drawerItemTouch}
                                            onPress={() => {
                                                setDrawerVisible(false);
                                                navigation.navigate('Signup' as never, { role: 'patient' } as never);
                                            }}
                                        >
                                            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                                                <Icon name="person-add" size={22} color="#10B981" />
                                            </View>
                                            <Text style={styles.drawerItemText}>Join as Patient</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.drawerItemTouch}
                                        onPress={async () => {
                                            await AsyncStorage.multiRemove(['token', 'userId', 'role', 'doctorId', 'whatsappnumber']);
                                            setIsLoggedIn(false);
                                            setDrawerVisible(false);
                                            navigation.reset({
                                                index: 0,
                                                routes: [{ name: 'Main' }],
                                            } as any);
                                        }}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                                            <Icon name="log-out" size={22} color="#EF4444" />
                                        </View>
                                        <Text style={styles.drawerItemText}>Logout</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollViewContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    searchContainer: {
        // Deprecated, replaced by headerContainer logic but kept to avoid break if referenced elsewhere
        display: 'none',
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
        zIndex: 100, // For dropdown
        borderBottomWidth: 1,
        borderBottomColor: '#F5F7FA',
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 12,
    },
    brandTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1F3A',
        letterSpacing: 0.5,
    },
    locationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    locationLabel: {
        fontSize: 11,
        color: '#888',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    locationSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 14, // Smaller as requested
        fontWeight: '600',
        color: '#1A1F3A',
    },
    locationDropdown: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        maxHeight: 300,
        zIndex: 1000,
        paddingVertical: 8,
    },
    locationOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    locationOptionText: {
        fontSize: 14,
        color: '#1A1F3A',
        fontWeight: '500',
        flex: 1,
    },
    viewAllCitiesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#2D5BFF',
        marginTop: 8,
        marginHorizontal: 8,
        borderRadius: 10,
        justifyContent: 'center',
        shadowColor: '#2D5BFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    viewAllCitiesText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    // City Selection Modal Styles
    cityModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    cityModalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '85%',
        paddingTop: 20,
    },
    cityModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    cityModalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1F3A',
    },
    cityModalCloseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F7FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    citySearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    citySearchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1A1F3A',
        padding: 0,
    },
    citiesScrollView: {
        flex: 1,
    },
    citiesGridContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    cityCard: {
        width: '48%',
        backgroundColor: '#F5F7FA',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    cityCardSelected: {
        backgroundColor: '#E8EFFF',
        borderColor: '#2D5BFF',
    },
    cityCardText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1F3A',
        marginTop: 8,
        textAlign: 'center',
    },
    cityCardTextSelected: {
        color: '#2D5BFF',
    },
    // Drawer Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    drawerContent: {
        width: '75%',
        height: '100%',
        backgroundColor: '#FFFFFF',
        padding: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        marginBottom: 20,
    },
    menuTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1F3A',
    },
    menuItemsContainer: {
        gap: 12,
    },
    drawerItemTouch: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    drawerItemText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1F3A',
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#F5F7FA',
        borderRadius: 50,
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        backgroundColor: '#FF5252',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#FFF',
    },
    searchRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA', // Light gray background
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
        gap: 10,
    },
    inputContainer: {
        marginTop: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        height: '100%',
    },
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2D5BFF',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
        height: 50,
    },
    searchButtonDisabled: {
        backgroundColor: '#B0B0B0',
        opacity: 0.6,
    },
    searchHelperText: {
        fontSize: 11,
        color: '#FF6B6B',
        fontWeight: '500',
        position: 'absolute',
        right: 16,
    },
    // Auto-suggest Dropdown Styles
    suggestionsDropdown: {
        position: 'absolute',
        top: 120,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        maxHeight: 300,
        zIndex: 999,
    },
    suggestionsScrollView: {
        maxHeight: 300,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    suggestionAvatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    suggestionAvatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    suggestionInfo: {
        flex: 1,
    },
    suggestionName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1F3A',
        marginBottom: 2,
    },
    suggestionSpecialty: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    suggestionCity: {
        fontSize: 12,
        color: '#999',
    },
    searchButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    specialitiesContainer: {
        marginTop: 16,
        marginBottom: 0,
    },
    specialitiesContent: {
        paddingHorizontal: 0,
        gap: 10,
    },
    specialityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingRight: 16,
        paddingLeft: 6, // Space for icon container
        paddingVertical: 6,
        borderRadius: 30,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    specialityChipSelected: {
        backgroundColor: '#5B7FFF', // Full filled color when selected? Or just border? Let's go with fill for attraction
        borderColor: '#5B7FFF',
    },
    specialityIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8EFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    specialityIconContainerSelected: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    specialityIcon: {
        // Removed
    },
    specialityChipText: {
        fontSize: 14,
        color: '#1A1F3A',
        fontWeight: '600',
    },
    specialityChipTextSelected: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    viewAllChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    viewAllChipText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        marginRight: 4,
    },
    locationDropdown: {
        position: 'absolute',
        top: 60,
        left: 20,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 200,
    },
    locationOption: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    locationOptionText: {
        fontSize: 14,
        color: '#333',
    },
    heroCard: {
        backgroundColor: '#1A1F3A',
        marginHorizontal: 16,
        marginTop: 20,
        padding: 24,
        borderRadius: 24,
        minHeight: 140,
        // Deep shadow for floating effect
        shadowColor: "#5B7FFF",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 16,
        lineHeight: 30,
        letterSpacing: 0.5,
    },
    heroButton: {
        backgroundColor: '#5B7FFF',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    heroButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        marginTop: 24,
        gap: 16,
        justifyContent: 'space-between',
    },
    serviceCard: {
        width: '47%', // Slightly smaller to leave room for shadows
        borderRadius: 20,
        padding: 14,
        minHeight: 130,
        justifyContent: 'space-between',
        marginBottom: 8,
        // Neumorphism: Soft, diffuse shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.1, // Very soft
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 0, // Remove borders
    },
    blueCard: {
        backgroundColor: '#E8EFFF',
        shadowColor: "#5B7FFF", // Colored shadow
        shadowOpacity: 0.15,
    },
    greenCard: {
        backgroundColor: '#E0F7F5',
        shadowColor: "#4ECDC4",
        shadowOpacity: 0.15,
    },
    orangeCard: {
        backgroundColor: '#FFF4E0',
        shadowColor: "#FFB06B",
        shadowOpacity: 0.15,
    },
    purpleCard: {
        backgroundColor: '#F3EFFF',
        shadowColor: "#A78BFA",
        shadowOpacity: 0.15,
    },
    serviceIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        // Mini float effect
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    serviceTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1A1F3A',
        marginBottom: 6,
        lineHeight: 18,
    },
    serviceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    serviceSubtitle: {
        fontSize: 8,
        color: '#666',
        letterSpacing: 0.5,
        fontWeight: '600',
    },
    bookButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    urgentButton: {
        backgroundColor: '#FF6B9D',
    },
    bookButtonText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#1A1F3A', // Dark text for contrast
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 28,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1F3A',
        letterSpacing: 0.5,
    },
    seeAllText: {
        fontSize: 12,
        color: '#5B7FFF',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    specialistsList: {
        paddingLeft: 16,
        paddingBottom: 20, // Space for shadows
    },
    specialistCard: {
        width: 160,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginRight: 16,
        // Neumorphic Float
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 6,
        borderWidth: 0, // No border
        alignItems: 'center',
    },
    doctorImageContainer: {
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: "#000", // Shadow for image?
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    doctorName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1F3A',
        marginBottom: 6,
        textAlign: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 14,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
    },
    cardBookButton: {
        backgroundColor: '#5B7FFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        shadowColor: "#5B7FFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    onlineBtn: {
        backgroundColor: '#5B7FFF',
        marginBottom: 6,
    },
    clinicBtn: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#5B7FFF',
        elevation: 0,
        shadowOpacity: 0,
    },
    clinicBtnText: {
        color: '#5B7FFF',
    },
    cardActionContainer: {
        width: '100%',
        gap: 4,
    },
    cardBookButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    reviewCard: {
        backgroundColor: '#F8F8F8',
        marginHorizontal: 16,
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 10,
    },
    reviewText: {
        fontSize: 13,
        color: '#333',
        fontStyle: 'italic',
        marginBottom: 12,
        lineHeight: 20,
    },
    reviewAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    authorAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E8EFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#5B7FFF',
    },
    authorName: {
        fontSize: 11,
        fontWeight: '700',
        color: '#000',
    },
    authorLabel: {
        fontSize: 9,
        color: '#999',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: '100%',
        height: '90%', // Occupy most of screen
        padding: 20,
        marginTop: 'auto',
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
    calendarContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    dateCard: {
        width: 60,
        height: 80,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: '#FFF',
    },
    dateCardSelected: {
        backgroundColor: '#5B7FFF',
        borderColor: '#5B7FFF',
    },
    monthText: {
        fontSize: 10,
        color: '#666',
        marginBottom: 4,
    },
    dayText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    weekdayText: {
        fontSize: 10,
        color: '#666',
    },
    textSelected: {
        color: '#FFF',
    },
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    slotChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFF',
    },
    slotChipSelected: {
        backgroundColor: '#5B7FFF',
        borderColor: '#5B7FFF',
    },
    slotText: {
        fontSize: 12,
        color: '#333',
    },
    slotCategoryLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    slotChipDisabled: {
        backgroundColor: '#F5F5F5',
        borderColor: '#E0E0E0',
    },
    slotTextDisabled: {
        color: '#BBB',
    },
    inputGroup: {
        marginBottom: 12,
    },
    fieldLabel: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
        marginBottom: 6,
    },
    modalForm: {
        width: '100%',
        gap: 0,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        backgroundColor: '#F9F9F9',
        marginBottom: 8
    },
    dropdownRow: {
        marginTop: 10,
    },
    dropdownContainer: {
        marginBottom: 10,
    },
    dropdownListContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
        marginTop: 4,
        maxHeight: 150,
    },
    dropdownList: {
        maxHeight: 150,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#F9F9F9',
    },
    dropdownPlaceholder: {
        fontSize: 14,
        color: '#999',
    },
    dropdownSelectedText: {
        fontSize: 14,
        color: '#000',
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dropdownItemSelected: {
        backgroundColor: '#E8EFFF',
    },
    dropdownText: {
        fontSize: 13,
        color: '#333',
    },
    dropdownTextSelected: {
        fontWeight: '700',
        color: '#5B7FFF'
    },
    readOnlyField: {
        backgroundColor: '#F0F0F0',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    readOnlyText: {
        color: '#666',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F0F0F0',
    },
    confirmButton: {
        backgroundColor: '#5B7FFF',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: '600',
    },
    confirmButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
    calendarWrapper: {
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    // Feedback Styles
    reviewCardItem: {
        width: 280,
        backgroundColor: '#F8F8F8',
        padding: 16,
        borderRadius: 16,
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#EDEEF0',
    },
    reviewTextItem: {
        fontSize: 13,
        color: '#333',
        fontStyle: 'italic',
        marginBottom: 12,
        lineHeight: 20,
        minHeight: 60,
    },
    feedbackModalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        width: '90%',
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    ratingSelectContainer: {
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
        marginBottom: 20,
    },
});

export default HomeScreen;
