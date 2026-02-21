import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    Image,
    Dimensions,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- SHARED COMPONENTS (Matched with Doctor Setup UI) ---

const ProfileInput = ({ label, value, onChangeText, placeholder, icon, keyboardType, multiline, leftElement, editable = true }: any) => (
    <View style={[styles.profileInputContainer, !editable && styles.disabledInput]}>
        {leftElement}
        {icon && !leftElement && (
            <View style={styles.profileInputIcon}>
                <Icon name={icon} size={20} color="#666" />
            </View>
        )}
        <View style={styles.profileInputContent}>
            <Text style={styles.profileInputLabel}>{label}</Text>
            <TextInput
                style={[styles.profileInput, multiline && { minHeight: 60, height: 'auto', textAlignVertical: 'top' }, !editable && { color: '#999' }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999"
                keyboardType={keyboardType}
                multiline={multiline}
                editable={editable}
            />
        </View>
    </View>
);

const ProfileDropdown = ({ label, value, onPress, placeholder, icon }: any) => (
    <TouchableOpacity onPress={onPress} style={styles.profileInputContainer} activeOpacity={0.7}>
        {icon && (
            <View style={styles.profileInputIcon}>
                <Icon name={icon} size={20} color="#666" />
            </View>
        )}
        <View style={styles.profileInputContent}>
            <Text style={styles.profileInputLabel}>{label}</Text>
            <Text style={[styles.profileInput, !value && { color: '#999' }, { paddingTop: 4 }]}>
                {value || placeholder}
            </Text>
        </View>
        <Icon name="chevron-down" size={20} color="#999" style={{ marginRight: 10 }} />
    </TouchableOpacity>
);

// --- NEW MEDICAL HISTORY COMPONENTS ---

const MedicalCard = ({ title, icon, children, onAdd }: any) => (
    <View style={styles.medicalCard}>
        <View style={styles.medicalCardHeader}>
            <View style={styles.medicalCardTitleGroup}>
                <Icon name={icon} size={22} color="#5B7FFF" />
                <Text style={styles.medicalCardTitle}>{title}</Text>
            </View>
            <Icon name="chevron-forward" size={18} color="#CCC" />
        </View>
        <View style={styles.medicalCardContent}>
            {children}
        </View>
        {onAdd && (
            <TouchableOpacity style={styles.addRecordButton} onPress={onAdd}>
                <Text style={styles.addRecordButtonText}>Add Record</Text>
            </TouchableOpacity>
        )}
    </View>
);

const ConditionRow = ({ name, date, status, icon = "heart" }: any) => (
    <View style={styles.conditionRow}>
        <View style={styles.conditionIconContainer}>
            <Icon name={icon} size={22} color="#E57373" />
        </View>
        <View style={styles.conditionDetails}>
            <Text style={styles.conditionName}>{name}</Text>
            <Text style={styles.conditionDate}>Diagnosed {date}</Text>
        </View>
        <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{status}</Text>
            <Icon name="checkmark" size={12} color="#4CAF50" style={{ marginLeft: 4 }} />
        </View>
        <Icon name="chevron-forward" size={18} color="#CCC" style={{ marginLeft: 8 }} />
    </View>
);

const MedicationRow = ({ name, dose, info, date }: any) => (
    <View style={styles.medicationRow}>
        <View style={styles.medicationIconContainer}>
            <Icon name="medical" size={20} color="#5B7FFF" />
        </View>
        <View style={styles.medicationDetails}>
            <Text style={styles.medicationName}>{name} {dose}</Text>
            <Text style={styles.medicationInfo}>{info}</Text>
        </View>
        <Text style={styles.medicationDate}>Started {date}</Text>
    </View>
);

const HistoryItem = ({ label, value, date, icon, unit }: any) => (
    <View style={styles.historyItem}>
        <View style={styles.historyIconContainer}>
            <Icon name={icon} size={20} color="#5B7FFF" />
        </View>
        <View style={styles.historyTextGroup}>
            <Text style={styles.historyLabel}>{label}</Text>
            <Text style={styles.historyValue}>{value}{unit ? ` ${unit}` : ''}</Text>
        </View>
        <Text style={styles.historyDate}>Last measured {date}</Text>
    </View>
);

const AllergyRow = ({ name, reaction, severity, icon = "medkit" }: any) => (
    <View style={styles.conditionRow}>
        <View style={[styles.conditionIconContainer, { backgroundColor: icon === 'medkit' ? '#FFF0F0' : '#FFF8F0' }]}>
            <Icon name={icon} size={22} color={icon === 'medkit' ? '#E14D2A' : '#FFA726'} />
        </View>
        <View style={styles.conditionDetails}>
            <Text style={styles.conditionName}>{name}</Text>
            <Text style={styles.conditionDate}>{reaction}</Text>
        </View>
        {severity && (
            <View style={[styles.severityBadge, severity.toLowerCase() === 'severe' && styles.severitySevere]}>
                <Text style={[styles.severityText, severity.toLowerCase() === 'severe' && styles.severityTextSevere]}>{severity}</Text>
                <Icon name="chevron-down" size={10} color={severity.toLowerCase() === 'severe' ? '#E14D2A' : '#FFA726'} />
            </View>
        )}
        <Icon name="chevron-forward" size={18} color="#CCC" style={{ marginLeft: 8 }} />
    </View>
);

const VitalGridCard = ({ label, subLabel, time, icon, color }: any) => (
    <View style={styles.vitalGridCard}>
        <View style={styles.vitalGridTop}>
            <View style={[styles.vitalIconContainer, { backgroundColor: `${color}15` }]}>
                <Icon name={icon} size={18} color={color} />
            </View>
            <View style={styles.vitalTextGroup}>
                <Text style={styles.vitalLabel}>{label}</Text>
                {subLabel ? <Text style={styles.vitalSubLabel}>{subLabel}</Text> : null}
            </View>
        </View>
        <Text style={styles.vitalTime}>{time}</Text>
    </View>
);

const SelectionModal = ({ visible, title, options, selectedValue, onSelect, onClose }: any) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <TouchableOpacity onPress={onClose}><Icon name="close" size={24} color="#333" /></TouchableOpacity>
                </View>
                <ScrollView style={styles.modalList}>
                    {options.map((option: string) => (
                        <TouchableOpacity
                            key={option}
                            style={[styles.modalOption, selectedValue === option && styles.modalOptionSelected]}
                            onPress={() => { onSelect(option); onClose(); }}
                        >
                            <Text style={[styles.modalOptionText, selectedValue === option && styles.modalOptionTextSelected]}>{option}</Text>
                            {selectedValue === option && <Icon name="checkmark" size={20} color="#5B7FFF" />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    </Modal>
);

// --- CONSTANTS ---
const STEPS = ['Personal', 'Medical History', 'Vitals'];
const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const AddRecordModal = ({ visible, type, onClose, onSave }: any) => {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (visible) setFormData({});
    }, [visible, type]);

    const renderFields = () => {
        switch (type) {
            case 'Condition':
                return (
                    <>
                        <ProfileInput label="Condition Name" placeholder="e.g. Asthma" value={formData.name} onChangeText={(t: string) => setFormData({ ...formData, name: t })} icon="heart-outline" />
                        <ProfileInput label="Diagnosis Date" placeholder="e.g. Jan 2020" value={formData.date} onChangeText={(t: string) => setFormData({ ...formData, date: t })} icon="calendar-outline" />
                        <ProfileInput label="Status" placeholder="Active / Inactive" value={formData.status} onChangeText={(t: string) => setFormData({ ...formData, status: t })} icon="checkmark-circle-outline" />
                    </>
                );
            case 'Medication':
                return (
                    <>
                        <ProfileInput label="Medicine Name" placeholder="e.g. Panadol" value={formData.name} onChangeText={(t: string) => setFormData({ ...formData, name: t })} icon="medical-outline" />
                        <ProfileInput label="Dosage" placeholder="e.g. 500mg" value={formData.dose} onChangeText={(t: string) => setFormData({ ...formData, dose: t })} icon="flask-outline" />
                        <ProfileInput label="Frequency / Info" placeholder="e.g. Twice a day" value={formData.info} onChangeText={(t: string) => setFormData({ ...formData, info: t })} icon="time-outline" />
                        <ProfileInput label="Start Date" placeholder="e.g. Oct 2023" value={formData.date} onChangeText={(t: string) => setFormData({ ...formData, date: t })} icon="calendar-outline" />
                    </>
                );
            case 'Allergy':
                return (
                    <>
                        <ProfileInput label="Allergen" placeholder="e.g. Penicillin" value={formData.name} onChangeText={(t: string) => setFormData({ ...formData, name: t })} icon="warning-outline" />
                        <ProfileInput label="Reaction" placeholder="e.g. Rash" value={formData.reaction} onChangeText={(t: string) => setFormData({ ...formData, reaction: t })} icon="alert-outline" />
                        <ProfileInput label="Severity" placeholder="Mild / Severe" value={formData.severity} onChangeText={(t: string) => setFormData({ ...formData, severity: t })} icon="podium-outline" />
                        <ProfileInput label="Category" placeholder="Drug/Food/Environmental/Other" value={formData.category} onChangeText={(t: string) => setFormData({ ...formData, category: t })} icon="list-outline" />
                    </>
                );
            case 'Measurement':
                return (
                    <>
                        <ProfileInput label="Height" placeholder="e.g. 5 foot 9 inch" value={formData.height} onChangeText={(t: string) => setFormData({ ...formData, height: t })} icon="body-outline" />
                        <ProfileInput label="Weight" placeholder="e.g. 170" value={formData.weight} onChangeText={(t: string) => setFormData({ ...formData, weight: t })} icon="speedometer-outline" keyboardType="numeric" />
                    </>
                );
            case 'Vitals':
                return (
                    <>
                        <ProfileInput label="Blood Pressure" placeholder="e.g. 120/80" value={formData.bp} onChangeText={(t: string) => setFormData({ ...formData, bp: t })} icon="heart-outline" />
                        <ProfileInput label="Heart Rate (BPM)" placeholder="e.g. 72" value={formData.hr} onChangeText={(t: string) => setFormData({ ...formData, hr: t })} icon="pulse-outline" keyboardType="numeric" />
                        <ProfileInput label="Temperature (°C)" placeholder="e.g. 36.5" value={formData.temp} onChangeText={(t: string) => setFormData({ ...formData, temp: t })} icon="thermometer-outline" keyboardType="numeric" />
                        <ProfileInput label="SpO2 (%)" placeholder="e.g. 98" value={formData.spo2} onChangeText={(t: string) => setFormData({ ...formData, spo2: t })} icon="water-outline" keyboardType="numeric" />
                    </>
                );
            case 'Family Record':
                return (
                    <>
                        <ProfileInput label="Father's Medical History" placeholder="e.g. None or Diabetes" value={formData.father} onChangeText={(t: string) => setFormData({ ...formData, father: t })} icon="man-outline" />
                        <ProfileInput label="Mother's Medical History" placeholder="e.g. Hypertension" value={formData.mother} onChangeText={(t: string) => setFormData({ ...formData, mother: t })} icon="woman-outline" />
                    </>
                );
            case 'Social Record':
                return (
                    <>
                        <ProfileInput label="Smoker Status" placeholder="e.g. Non-smoker or 10 years" value={formData.smoker} onChangeText={(t: string) => setFormData({ ...formData, smoker: t })} icon="close-circle-outline" />
                        <ProfileInput label="Alcohol/Drinking" placeholder="e.g. Occasionally" value={formData.drinks} onChangeText={(t: string) => setFormData({ ...formData, drinks: t })} icon="wine-outline" />
                    </>
                );
            default:
                return <Text style={{ textAlign: 'center', padding: 20 }}>Unsupported record type</Text>;
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add {type}</Text>
                        <TouchableOpacity onPress={onClose}><Icon name="close" size={24} color="#333" /></TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                        {renderFields()}
                        <TouchableOpacity
                            style={styles.saveRecordBtn}
                            onPress={() => onSave(formData)}
                        >
                            <Text style={styles.saveRecordBtnText}>Save Record</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(0);

    // Patient Data State
    const [patientData, setPatientData] = useState({
        // Personal
        name: '',
        gender: '',
        bloodType: '',
        phone: '',
        email: '',
        address: '',
        age: '',
        // Medical History - Structural data for cards
        conditions: [] as any[],
        medicationsList: [] as any[],
        allergyData: {
            drug: [] as any[],
            food: [] as any[],
            environmental: [] as any[],
            other: [] as any[]
        },
        familyHistoryList: { father: '', mother: '' },
        socialHistory: { smoker: '', drinks: '' },
        otherRecords: [] as any[],
        // Vitals
        vitalsHistory: {
            height: { value: '--', date: 'Never' },
            weight: { value: '--', unit: 'lbs', date: 'Never' },
            bmi: { value: '--', date: 'Never' }
        },
        vitalGrid: [
            { id: 'bp', label: '--', subLabel: 'mmHg', time: 'No data', icon: 'heart', color: '#E14D2A' },
            { id: 'hr', label: '-- BPM', subLabel: 'Normal', time: 'No data', icon: 'pulse', color: '#E14D2A' },
            { id: 'temp', label: '-- °C', subLabel: 'Body Temp', time: 'No data', icon: 'thermometer', color: '#5B7FFF' },
            { id: 'spo2', label: '-- %', subLabel: 'Oxygen', time: 'No data', icon: 'water', color: '#5B7FFF' }
        ],
        sugarLevel: '',
        bloodPressure: '',
        bloodGroup: ''
    });

    const [modalConfig, setModalConfig] = useState({ visible: false, title: '', options: [] as string[], field: '' });
    const [addRecordConfig, setAddRecordConfig] = useState({ visible: false, type: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const role = await AsyncStorage.getItem('role');
            const phone = await AsyncStorage.getItem('whatsappnumber');
            const token = await AsyncStorage.getItem('token');
            const userId = await AsyncStorage.getItem('userId');

            setUserRole(role);

            if (role?.toLowerCase() === 'doctor') {
                await fetchDoctorProfile(userId, token);
            } else {
                setPatientData(prev => ({ ...prev, phone: phone || '' }));
                await fetchPatientProfile(userId, token);
            }
        } catch (err) {
            setError('Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctorProfile = async (userId: string | null, token: string | null) => {
        const doctorId = await AsyncStorage.getItem('doctorId');
        if (!doctorId || !token) return;
        try {
            const response = await fetch(`https://appbookingbackend.onrender.com/api/doctor/${doctorId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProfile(data.data || data.doctor || data);
            }
        } catch (e) { }
    };

    const fetchPatientProfile = async (userId: string | null, token: string | null) => {
        if (!userId || !token) return;
        try {
            const response = await fetch(`https://appbookingbackend.onrender.com/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const u = data.data || data.user || data;
                setPatientData(prev => ({
                    ...prev,
                    name: u.name || '',
                    gender: u.gender || '',
                    bloodType: u.bloodType || '',
                    age: u.age ? String(u.age) : '',
                    phone: u.whatsappnumber || u.phone || prev.phone,
                    email: u.email || '',
                    address: u.address || '',
                    sugarLevel: u.sugarLevel || '',
                    bloodPressure: u.bloodPressure || ''
                }));
            }
        } catch (e) { }
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout', style: 'destructive', onPress: async () => {
                    await AsyncStorage.clear();
                    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
                }
            }
        ]);
    };

    const handleSave = async () => {
        Alert.alert('Success', 'Profile updated successfully!');
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSave();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const openSelection = (title: string, options: string[], field: string) => {
        setModalConfig({ visible: true, title, options, field });
    };

    const handleAddRecord = (section: string) => {
        setAddRecordConfig({ visible: true, type: section });
    };

    const saveNewRecord = (data: any) => {
        if (!data.name && addRecordConfig.type !== 'Measurement') {
            Alert.alert('Error', 'Please enter at least a name.');
            return;
        }

        const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        setPatientData((prev: any) => {
            const newData = { ...prev };
            switch (addRecordConfig.type) {
                case 'Condition':
                    newData.conditions = [...prev.conditions, { ...data, icon: 'heart' }];
                    break;
                case 'Medication':
                    newData.medicationsList = [...prev.medicationsList, { ...data }];
                    break;
                case 'Allergy':
                    const cat = (data.category || 'other').toLowerCase();
                    newData.allergyData[cat] = [...(prev.allergyData[cat] || []), { ...data }];
                    break;
                case 'Measurement':
                    if (data.height) newData.vitalsHistory.height = { value: data.height, date: dateStr };
                    if (data.weight) newData.vitalsHistory.weight = { value: data.weight, unit: 'lbs', date: dateStr };
                    if (data.weight) newData.vitalsHistory.bmi = { value: '24', date: dateStr };
                    break;
                case 'Family Record':
                    newData.familyHistoryList = { ...prev.familyHistoryList, ...data };
                    break;
                case 'Social Record':
                    newData.socialHistory = { ...prev.socialHistory, ...data };
                    break;
                case 'Vitals':
                    newData.vitalGrid = prev.vitalGrid.map((item: any) => {
                        if (item.id === 'bp' && data.bp) return { ...item, label: data.bp, time: 'Just now' };
                        if (item.id === 'hr' && data.hr) return { ...item, label: `${data.hr} BPM`, time: 'Just now' };
                        if (item.id === 'temp' && data.temp) return { ...item, label: `${data.temp} °C`, time: 'Just now' };
                        if (item.id === 'spo2' && data.spo2) return { ...item, label: `${data.spo2} %`, time: 'Just now' };
                        return item;
                    });
                    break;
            }
            return newData;
        });

        setAddRecordConfig({ visible: false, type: '' });
        Alert.alert('Success', `${addRecordConfig.type} added successfully!`);
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#5B7FFF" /></View>;
    }

    if (userRole?.toLowerCase() === 'doctor') {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.docContainer}>
                    {profile ? (
                        <>
                            <View style={styles.docHeader}>
                                <View style={styles.avatarCircle}><Icon name="person" size={50} color="#FFF" /></View>
                                <Text style={styles.docName}>{profile.name}</Text>
                                <Text style={styles.docSub}>{profile.specialization || 'Doctor'}</Text>
                            </View>
                            <View style={styles.docSection}>
                                <Text style={styles.docSectionTitle}>Contact Info</Text>
                                <View style={styles.docRow}><Icon name="mail" size={18} color="#666" /><Text style={styles.docText}>{profile.email}</Text></View>
                                <View style={styles.docRow}><Icon name="call" size={18} color="#666" /><Text style={styles.docText}>{profile.whatsappnumber}</Text></View>
                            </View>
                        </>
                    ) : <Text>Doctor profile not found.</Text>}
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}><Text style={styles.logoutText}>Logout</Text></TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // Patient View
    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header matched with Doctor Setup UI style */}
            <View style={styles.headerContainer}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        {currentStep > 0 && <Icon name="arrow-back" size={24} color="#FFF" />}
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Patient Registration</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.avatarContainer}>
                    <View style={styles.avatarWrapper}>
                        <View style={[styles.avatarImage, { backgroundColor: '#E1E8FF', alignItems: 'center', justifyContent: 'center' }]}>
                            <Icon name="person" size={60} color="#5B7FFF" />
                        </View>
                    </View>
                </View>

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
            </View>

            <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
                {currentStep === 0 && (
                    <View style={styles.stepContainer}>
                        <ProfileInput
                            label="Name"
                            icon="person-outline"
                            placeholder="John Doe"
                            value={patientData.name}
                            onChangeText={(t: string) => setPatientData(p => ({ ...p, name: t }))}
                        />
                        <ProfileInput
                            label="Age"
                            icon="calendar-outline"
                            placeholder="25"
                            value={patientData.age}
                            onChangeText={(t: string) => setPatientData(p => ({ ...p, age: t }))}
                            keyboardType="numeric"
                        />
                        <ProfileDropdown
                            label="Gender"
                            icon="male-female-outline"
                            value={patientData.gender}
                            onPress={() => openSelection('Select Gender', GENDERS, 'gender')}
                            placeholder="Select Gender"
                        />
                        <ProfileDropdown
                            label="Blood Type"
                            icon="water-outline"
                            value={patientData.bloodType}
                            onPress={() => openSelection('Select Blood Type', BLOOD_TYPES, 'bloodType')}
                            placeholder="Select Blood Type"
                        />
                        <ProfileInput
                            label="Phone No"
                            icon="call-outline"
                            value={patientData.phone}
                            editable={false}
                        />
                        <ProfileInput
                            label="Email"
                            icon="mail-outline"
                            placeholder="john@example.com"
                            value={patientData.email}
                            onChangeText={(t: string) => setPatientData(p => ({ ...p, email: t }))}
                            keyboardType="email-address"
                        />
                        <ProfileInput
                            label="Address"
                            icon="location-outline"
                            placeholder="City, Street"
                            value={patientData.address}
                            onChangeText={(t: string) => setPatientData(p => ({ ...p, address: t }))}
                            multiline
                        />
                    </View>
                )}

                {currentStep === 1 && (
                    <View style={styles.stepContainer}>
                        <MedicalCard title="Chronic Conditions" icon="heart-outline" onAdd={() => handleAddRecord('Condition')}>
                            {patientData.conditions.map((item, id) => (
                                <ConditionRow key={id} name={item.name} date={item.date} status={item.status} icon={item.icon} />
                            ))}
                        </MedicalCard>

                        <MedicalCard title="Chronic Medications" icon="medical-outline" onAdd={() => handleAddRecord('Medication')}>
                            {patientData.medicationsList.map((item, id) => (
                                <MedicationRow key={id} name={item.name} dose={item.dose} info={item.info} date={item.date} />
                            ))}
                        </MedicalCard>

                        <MedicalCard title="Family History" icon="people-outline" onAdd={() => handleAddRecord('Family Record')}>
                            <View style={styles.historyInlineRow}>
                                <Text style={styles.historyLabel}>Father - </Text>
                                <Text style={styles.historyValue}>{patientData.familyHistoryList.father}</Text>
                                <View style={styles.separator} />
                                <Text style={styles.historyLabel}>Mother - </Text>
                                <Text style={styles.historyValue}>{patientData.familyHistoryList.mother}</Text>
                            </View>
                        </MedicalCard>

                        <MedicalCard title="Social History" icon="wine-outline" onAdd={() => handleAddRecord('Social Record')}>
                            <View style={styles.historyInlineRow}>
                                <Text style={styles.historyLabel}>Smoker </Text>
                                <Text style={styles.historyValue}>({patientData.socialHistory.smoker})</Text>
                                <View style={styles.separator} />
                                <Text style={styles.historyLabel}>Drinks </Text>
                                <Text style={styles.historyValue}>{patientData.socialHistory.drinks}</Text>
                            </View>
                        </MedicalCard>
                    </View>
                )}

                {currentStep === 2 && (
                    <View style={styles.stepContainer}>
                        {/* Current Vitals Card */}
                        <MedicalCard
                            title="Current Vitals"
                            icon="pulse-outline"
                            onAdd={() => handleAddRecord('Vitals')}
                        >
                            <View style={styles.vitalGridContainer}>
                                {patientData.vitalGrid.map((item) => (
                                    <VitalGridCard
                                        key={item.id}
                                        label={item.label}
                                        subLabel={item.subLabel}
                                        time={item.time}
                                        icon={item.icon}
                                        color={item.color}
                                    />
                                ))}
                            </View>
                        </MedicalCard>

                        {/* Consolidated Allergies Card */}
                        <MedicalCard
                            title="Allergies"
                            icon="medical-outline"
                            onAdd={() => handleAddRecord('Allergy')}
                        >
                            {/* Drug Allergies */}
                            {patientData.allergyData.drug.length > 0 && (
                                <View style={{ marginBottom: 10 }}>
                                    <Text style={styles.subTitle}>Drug Allergies</Text>
                                    {patientData.allergyData.drug.map((item: any, id: number) => (
                                        <AllergyRow key={id} name={item.name} reaction={item.reaction} severity={item.severity} icon="medkit" />
                                    ))}
                                </View>
                            )}

                            {/* Food Allergies */}
                            {patientData.allergyData.food.length > 0 && (
                                <View style={{ marginBottom: 10 }}>
                                    <Text style={styles.subTitle}>Food Allergies</Text>
                                    {patientData.allergyData.food.map((item: any, id: number) => (
                                        <AllergyRow key={id} name={item.name} reaction={item.reaction} severity={item.severity} icon="nutrition" />
                                    ))}
                                </View>
                            )}

                            {/* Environmental Allergies */}
                            {patientData.allergyData.environmental.length > 0 && (
                                <View style={{ marginBottom: 10 }}>
                                    <Text style={styles.subTitle}>Environmental Allergies</Text>
                                    {patientData.allergyData.environmental.map((item: any, id: number) => (
                                        <AllergyRow key={id} name={item.name} reaction={item.reaction} severity={item.severity} icon="leaf" />
                                    ))}
                                </View>
                            )}

                            {/* Other Allergies */}
                            {patientData.allergyData.other.length > 0 && (
                                <View style={{ marginBottom: 10 }}>
                                    <Text style={styles.subTitle}>Other Allergies</Text>
                                    {patientData.allergyData.other.map((item: any, id: number) => (
                                        <AllergyRow key={id} name={item.name} reaction={item.reaction} severity={item.severity} icon="alert-circle" />
                                    ))}
                                </View>
                            )}

                            {/* Empty State for Allergies inside Card */}
                            {patientData.allergyData.drug.length === 0 &&
                                patientData.allergyData.food.length === 0 &&
                                patientData.allergyData.environmental.length === 0 &&
                                patientData.allergyData.other.length === 0 && (
                                    <Text style={{ color: '#999', textAlign: 'center', paddingVertical: 10 }}>No allergies recorded yet.</Text>
                                )}
                        </MedicalCard>

                        {/* History Card (Bottom) */}
                        <MedicalCard title="History" icon="stats-chart-outline" onAdd={() => handleAddRecord('Measurement')}>
                            <HistoryItem
                                label="Height"
                                value={patientData.vitalsHistory.height.value}
                                date={patientData.vitalsHistory.height.date}
                                icon="body-outline"
                            />
                            <HistoryItem
                                label="Weight"
                                value={patientData.vitalsHistory.weight.value}
                                unit={patientData.vitalsHistory.weight.unit}
                                date={patientData.vitalsHistory.weight.date}
                                icon="speedometer-outline"
                            />
                            <HistoryItem
                                label="BMI"
                                value={patientData.vitalsHistory.bmi.value}
                                date={patientData.vitalsHistory.bmi.date}
                                icon="bar-chart-outline"
                            />
                        </MedicalCard>
                    </View>
                )}

                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>
                        {currentStep === STEPS.length - 1 ? 'Save & Finish' : 'Next Step'}
                    </Text>
                    <Icon name={currentStep === STEPS.length - 1 ? "checkmark-done" : "arrow-forward"} size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutLink} onPress={handleLogout}>
                    <Icon name="log-out-outline" size={18} color="#FF6B6B" />
                    <Text style={styles.logoutLinkText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView >

            <SelectionModal
                visible={modalConfig.visible}
                title={modalConfig.title}
                options={modalConfig.options}
                selectedValue={(patientData as any)[modalConfig.field]}
                onSelect={(val: string) => setPatientData(p => ({ ...p, [modalConfig.field]: val }))}
                onClose={() => setModalConfig(p => ({ ...p, visible: false }))}
            />

            <AddRecordModal
                visible={addRecordConfig.visible}
                type={addRecordConfig.type}
                onClose={() => setAddRecordConfig({ visible: false, type: '' })}
                onSave={saveNewRecord}
            />
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8F9FD' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    formContent: { padding: 20 },

    // Header Style (Matched with Doctor Setup)
    headerContainer: { backgroundColor: '#5B7FFF', paddingBottom: 10, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, marginBottom: 10 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
    backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },

    avatarContainer: { alignItems: 'center', marginTop: 10, marginBottom: 15 },
    avatarWrapper: { position: 'relative' },
    avatarImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#FFF' },

    tabContainer: { marginTop: 10 },
    tabContent: { paddingHorizontal: 20 },
    tabItem: { paddingHorizontal: 20, paddingVertical: 10, marginRight: 15, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
    tabItemActive: { backgroundColor: '#FFF' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#E0E7FF' },
    tabTextActive: { color: '#5B7FFF' },

    // Form Components (Matched with Doctor Setup)
    profileInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, borderWidth: 1, borderColor: '#F0F3F9', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
    profileInputIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    profileInputContent: { flex: 1 },
    profileInputLabel: { fontSize: 12, color: '#8E94A9', fontWeight: '700', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
    profileInput: { fontSize: 16, color: '#1A1F3A', fontWeight: '600', padding: 0 },
    disabledInput: { backgroundColor: '#F5F7FA' },

    stepContainer: { marginTop: 10 },

    nextButton: { backgroundColor: '#5B7FFF', flexDirection: 'row', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10, shadowColor: '#5B7FFF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    nextButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800' },

    logoutLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 25, paddingBottom: 20 },
    logoutLinkText: { color: '#FF6B6B', fontWeight: '800', marginLeft: 8, fontSize: 14 },

    // Doctor Styles (Dashboard Style)
    docContainer: { padding: 20 },
    docHeader: { alignItems: 'center', backgroundColor: '#FFF', padding: 30, borderRadius: 25, elevation: 3 },
    avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#5B7FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    docName: { fontSize: 24, fontWeight: 'bold', color: '#1A1F3A' },
    docSub: { fontSize: 16, color: '#666', marginTop: 4 },
    docSection: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginTop: 20, elevation: 2 },
    docSectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    docRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    docText: { marginLeft: 12, fontSize: 16, color: '#555' },
    logoutBtn: { marginTop: 30, backgroundColor: '#FFF', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FF6B6B' },
    logoutText: { color: '#FF6B6B', fontWeight: '700', fontSize: 16 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 40, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#F0F3F9' },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1A1F3A' },
    modalList: { padding: 15 },
    modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 20, marginBottom: 8 },
    modalOptionSelected: { backgroundColor: '#F0F5FF' },
    modalOptionText: { fontSize: 16, color: '#444', fontWeight: '600' },
    modalOptionTextSelected: { color: '#5B7FFF', fontWeight: '800' },

    // --- NEW MEDICAL & HISTORY STYLES ---

    medicalCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        marginBottom: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F0F3F9',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    medicalCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    medicalCardTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    medicalCardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1F3A',
        letterSpacing: 0.3,
    },
    medicalCardContent: {
        paddingHorizontal: 5,
    },
    subTitle: {
        fontSize: 14,
        color: '#8E94A9',
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 5,
    },
    addRecordButton: {
        backgroundColor: '#0047AB',
        paddingVertical: 8,
        paddingHorizontal: 32,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
        alignSelf: 'center',
    },
    addRecordButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },

    conditionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F3F9',
    },
    conditionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFF4F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    conditionDetails: {
        flex: 1,
    },
    conditionName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1F3A',
    },
    conditionDate: {
        fontSize: 13,
        color: '#8E94A9',
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusBadgeText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '700',
    },

    medicationRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F3F9',
    },
    medicationIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    medicationDetails: {
        flex: 1,
    },
    medicationName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1F3A',
    },
    medicationInfo: {
        fontSize: 13,
        color: '#8E94A9',
        marginTop: 2,
    },
    medicationDate: {
        fontSize: 12,
        color: '#8E94A9',
    },

    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F3F9',
    },
    historyIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F8FAFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    historyTextGroup: {
        flex: 1,
    },
    historyLabel: {
        fontSize: 14,
        color: '#8E94A9',
        fontWeight: '600',
    },
    historyValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A1F3A',
        marginTop: 2,
    },
    historyDate: {
        fontSize: 12,
        color: '#B0B5C9',
    },

    historyInlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    separator: {
        width: 1,
        height: 14,
        backgroundColor: '#E0E7FF',
        marginHorizontal: 12,
    },

    // Severity Badges
    severityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    severitySevere: {
        backgroundColor: '#FFF0F0',
    },
    severityText: {
        fontSize: 12,
        color: '#FFA726',
        fontWeight: '700',
    },
    severityTextSevere: {
        color: '#E14D2A',
    },

    // Vital Grid 2x2
    vitalGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    vitalGridCard: {
        width: '48%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#F0F3F9',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    vitalGridTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    vitalIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    vitalTextGroup: {
        flex: 1,
    },
    vitalLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1A1F3A',
    },
    vitalSubLabel: {
        fontSize: 10,
        color: '#8E94A9',
        fontWeight: '600',
    },
    vitalTime: {
        fontSize: 11,
        color: '#B0B5C9',
        fontWeight: '500',
    },
    saveRecordBtn: {
        backgroundColor: '#5B7FFF',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 10,
        shadowColor: '#5B7FFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    saveRecordBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
});

export default ProfileScreen;
