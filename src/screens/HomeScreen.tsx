import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Image,
    Modal,
    Alert,
    Animated,
    Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';

interface Specialist {
    id: number;
    name: string;
    role: string;
    rating: number;
    color: string;
}

const SPECIALISTS: Specialist[] = [
    { id: 1, name: 'Dr. Sarah Johnson', role: 'Clinical Psych', rating: 4.8, color: '#4ECDC4' },
    { id: 2, name: 'Dr. Michael Chen', role: 'Psychiatrist', rating: 4.9, color: '#5B7FFF' },
    { id: 3, name: 'Dr. Emma Wilson', role: 'Therapist', rating: 4.7, color: '#A78BFA' },
];

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
const TIME_SLOTS = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "4:00 PM"];

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
    const [isLoggedIn] = useState(false); // Mock state
    const [modalVisible, setModalVisible] = useState(false);

    // Booking State
    const [bookingType, setBookingType] = useState<'specialist' | 'service'>('service');
    const [selectedDoctor, setSelectedDoctor] = useState<Specialist | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // Dropdown UI State
    const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
    const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);

    // Patient Form State
    const [patientName, setPatientName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');

    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    // Feedback State
    const [reviews, setReviews] = useState<Review[]>(REVIEWS_DATA);
    const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackText, setFeedbackText] = useState('');

    const navigation = useNavigation();

    // Filtered Specialists
    const filteredSpecialists = SPECIALISTS.filter(specialist =>
        specialist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        specialist.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handlers
    const handleSpecialistBookPress = (doctor: Specialist) => {
        setBookingType('specialist');
        setSelectedDoctor(doctor);
        setSelectedDepartment(doctor.role); // Pre-fill dept based on role
        setModalVisible(true);
        // Reset other fields
        setSelectedDate(null);
        setSelectedTime(null);
    };

    const handleServiceBookPress = (serviceName: string) => {
        setBookingType('service');
        setSelectedDoctor(null);
        // Map service name to dept if possible, else empty
        const deptMap: { [key: string]: string } = {
            'Psychiatric Clinic': 'Psychiatry',
            'Online Consultation': 'Clinical Psychology',
        };
        setSelectedDepartment(deptMap[serviceName] || '');
        setModalVisible(true);
        // Reset
        setSelectedDate(null);
        setSelectedTime(null);
    };

    const handleScheduleAppointment = () => {
        // Validation
        if (!selectedDate || !selectedTime) {
            Alert.alert("Missing Info", "Please select a Date and Time.");
            return;
        }

        if (bookingType === 'service' && (!selectedDepartment || !selectedDoctor)) {
            Alert.alert("Missing Info", "Please select a Department and Doctor.");
            return;
        }

        if (!isLoggedIn) {
            if (!patientName.trim() || !whatsappNumber.trim()) {
                Alert.alert("Required Fields", "Please enter Patient Name and WhatsApp Number.");
                return;
            }
        }

        // Prepare booking data
        const bookingData = {
            doctorName: selectedDoctor?.name,
            doctorRole: selectedDoctor?.role || selectedDepartment,
            date: selectedDate,
            time: selectedTime,
            patientName: isLoggedIn ? 'User' : patientName,
            whatsappNumber: isLoggedIn ? 'User-Phone' : whatsappNumber
        };

        setModalVisible(false);
        // @ts-ignore
        navigation.navigate('Payment', bookingData);

        // Reset form
        setPatientName('');
        setWhatsappNumber('');
        setSelectedDate(null);
        setSelectedTime(null);
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
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            {/* Header Removed */}

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="search-outline" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Find your specialist..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

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
                        <Icon name="videocam" size={32} color="#5B7FFF" />
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
                        <Icon name="medkit" size={32} color="#4ECDC4" />
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
                        <Icon name="alert-circle" size={32} color="#FF6B9D" />
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
                        <Icon name="clipboard" size={32} color="#A78BFA" />
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

                {filteredSpecialists.length > 0 ? (
                    filteredSpecialists.map((specialist, index) => (
                        <AnimatedCard
                            key={specialist.id}
                            index={index}
                            style={styles.specialistCard}
                            onPress={() => handleSpecialistBookPress(specialist)}
                        >
                            <View style={styles.doctorImageContainer}>
                                <Icon name="person-circle" size={50} color={specialist.color} />
                            </View>
                            <Text style={styles.doctorName}>{specialist.name}</Text>
                            <View style={styles.ratingContainer}>
                                <Icon name="star" size={12} color="#FFD700" />
                                <Text style={styles.ratingText}>{specialist.rating} • {specialist.role}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.cardBookButton}
                                onPress={() => handleSpecialistBookPress(specialist)}
                            >
                                <Text style={styles.cardBookButtonText}>Book Now</Text>
                            </TouchableOpacity>
                        </AnimatedCard>
                    ))
                ) : (
                    <Text style={{ marginLeft: 20, color: '#999' }}>No specialists found.</Text>
                )}
            </ScrollView>

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

                        {/* 2. Time Slots Section */}
                        <Text style={styles.sectionLabel}>Available Slots</Text>
                        <View style={styles.slotsGrid}>
                            {TIME_SLOTS.map((slot, index) => {
                                const isSelected = selectedTime === slot;
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.slotChip, isSelected && styles.slotChipSelected]}
                                        onPress={() => setSelectedTime(slot)}
                                    >
                                        <Text style={[styles.slotText, isSelected && styles.textSelected]}>{slot}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* 3. Department & Doctor Selection */}
                        <View style={styles.dropdownRow}>
                            <View style={styles.dropdownContainer}>
                                <Text style={styles.fieldLabel}>Department</Text>
                                {bookingType === 'specialist' ? (
                                    <View style={styles.readOnlyField}>
                                        <Text style={styles.readOnlyText}>{selectedDepartment}</Text>
                                    </View>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={styles.dropdownHeader}
                                            onPress={() => {
                                                setIsDeptDropdownOpen(!isDeptDropdownOpen);
                                                setIsDoctorDropdownOpen(false);
                                            }}
                                        >
                                            <Text style={selectedDepartment ? styles.dropdownSelectedText : styles.dropdownPlaceholder}>
                                                {selectedDepartment || "Select Department"}
                                            </Text>
                                            <Icon name={isDeptDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                                        </TouchableOpacity>

                                        {isDeptDropdownOpen && (
                                            <View style={styles.dropdownListContainer}>
                                                <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                                                    {DEPARTMENTS.map((dept, i) => (
                                                        <TouchableOpacity
                                                            key={i}
                                                            style={[styles.dropdownItem, selectedDepartment === dept && styles.dropdownItemSelected]}
                                                            onPress={() => {
                                                                setSelectedDepartment(dept);
                                                                setIsDeptDropdownOpen(false);
                                                            }}
                                                        >
                                                            <Text style={[styles.dropdownText, selectedDepartment === dept && styles.dropdownTextSelected]}>{dept}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>

                        <View style={styles.dropdownRow}>
                            <View style={styles.dropdownContainer}>
                                <Text style={styles.fieldLabel}>Doctor</Text>
                                {bookingType === 'specialist' ? (
                                    <View style={styles.readOnlyField}>
                                        <Text style={styles.readOnlyText}>{selectedDoctor?.name}</Text>
                                    </View>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={styles.dropdownHeader}
                                            onPress={() => {
                                                setIsDoctorDropdownOpen(!isDoctorDropdownOpen);
                                                setIsDeptDropdownOpen(false);
                                            }}
                                        >
                                            <Text style={selectedDoctor ? styles.dropdownSelectedText : styles.dropdownPlaceholder}>
                                                {selectedDoctor?.name || "Select Doctor"}
                                            </Text>
                                            <Icon name={isDoctorDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                                        </TouchableOpacity>

                                        {isDoctorDropdownOpen && (
                                            <View style={styles.dropdownListContainer}>
                                                <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                                                    {SPECIALISTS.map((doc, i) => (
                                                        <TouchableOpacity
                                                            key={i}
                                                            style={[styles.dropdownItem, selectedDoctor?.id === doc.id && styles.dropdownItemSelected]}
                                                            onPress={() => {
                                                                setSelectedDoctor(doc);
                                                                setIsDoctorDropdownOpen(false);
                                                            }}
                                                        >
                                                            <Text style={[styles.dropdownText, selectedDoctor?.id === doc.id && styles.dropdownTextSelected]}>{doc.name}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>

                        {/* 4. Patient Details Section */}
                        <Text style={styles.sectionLabel}>Patient Details</Text>
                        {!isLoggedIn && (
                            <View style={styles.modalForm}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.fieldLabel}>Patient Name</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Enter patient name"
                                        value={patientName}
                                        onChangeText={setPatientName}
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.fieldLabel}>WhatsApp Number</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Enter WhatsApp number"
                                        keyboardType="phone-pad"
                                        value={whatsappNumber}
                                        onChangeText={setWhatsappNumber}
                                    />
                                </View>
                            </View>
                        )}

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
                            >
                                <Text style={styles.confirmButtonText}>Book Appointment</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 20 }} />
                    </ScrollView>
                </View>
            </Modal>

            {/* Bottom Padding */}
            {/* <View style={{ height: 100 }} /> */}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        marginHorizontal: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20, // More rounded for Neumorphism
        gap: 12,
        // Inner shadow simulation (soft inset look)
        borderWidth: 1,
        borderColor: '#EDEEF0',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#000',
        paddingVertical: 0,
        fontWeight: '500',
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
        borderRadius: 24,
        padding: 18,
        minHeight: 160,
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
        width: 50,
        height: 50,
        borderRadius: 16,
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
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1F3A',
        marginBottom: 8,
        lineHeight: 22,
    },
    serviceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    serviceSubtitle: {
        fontSize: 9,
        color: '#666',
        letterSpacing: 0.5,
        fontWeight: '600',
    },
    bookButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
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
        fontSize: 10,
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
        width: 150,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end', // Slide from bottom or center
        alignItems: 'center',
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
