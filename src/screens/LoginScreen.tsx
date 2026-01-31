import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { role } = route.params || { role: 'Patient' };

    const [whatsapp, setWhatsapp] = useState('');

    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!whatsapp || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            // Format phone number
            let formattedPhone = whatsapp.replace(/\D/g, ''); // Remove non-digits
            if (formattedPhone.startsWith('0')) {
                formattedPhone = formattedPhone.substring(1);
            }
            if (!formattedPhone.startsWith('92')) {
                formattedPhone = '92' + formattedPhone;
            }

            const response = await fetch('https://appbookingbackend.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    whatsappnumber: formattedPhone, // formatted number
                    password: password
                }),
            });

            const data = await response.json();
            console.log('Login response data:', JSON.stringify(data, null, 2));

            if (response.status === 200 || response.status === 201) {
                const userRole = data.data?.role || role;

                if (userRole && userRole.toLowerCase() === 'doctor') {
                    const userId = data.data?.userId || data.data?._id || data.data?.user?.userId || data.data?.user?._id || data.userId;
                    const token = data.data?.accessToken || data.data?.token || data.token || data.accessToken;
                    const userWhatsapp = data.data?.user?.whatsappnumber || data.data?.whatsappnumber || formattedPhone;

                    console.log('Extracted userId:', userId);
                    console.log('Extracted token:', token);

                    // 1. Store authentication data in AsyncStorage
                    try {
                        await AsyncStorage.setItem('userId', userId || '');
                        await AsyncStorage.setItem('token', token || '');
                        await AsyncStorage.setItem('role', userRole);
                        await AsyncStorage.setItem('whatsappnumber', userWhatsapp);
                        console.log('Stored auth data including whatsapp:', userWhatsapp);
                    } catch (storageError) {
                        console.error('Failed to store auth data:', storageError);
                    }

                    // 2. Clear old doctorId and robustly check if doctor profile exists
                    await AsyncStorage.removeItem('doctorId');

                    try {
                        console.log('Checking if doctor profile exists (robustly via WhatsApp)...');
                        let doctor = null;

                        // Normalization function for robust phone number matching
                        const normalizePhone = (phone: string | undefined): string => {
                            if (!phone) return '';
                            // Remove all non-digits
                            let clean = phone.replace(/\D/g, '');
                            // Remove 92 prefix if present
                            if (clean.startsWith('92')) clean = clean.substring(2);
                            // Remove leading 0 if present
                            if (clean.startsWith('0')) clean = clean.substring(1);
                            return clean;
                        };

                        const normalizedUserWhatsapp = normalizePhone(userWhatsapp);
                        console.log('Searching for doctor with normalized WhatsApp:', normalizedUserWhatsapp);

                        // A. Try specific profile endpoint by userId first
                        const profileResponse = await fetch(`https://appbookingbackend.onrender.com/api/doctor/profile/${userId}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (profileResponse.ok) {
                            const pData = await profileResponse.json();
                            doctor = pData.data || pData.doctor || pData;
                            if (Array.isArray(doctor) && doctor.length > 0) doctor = doctor[0];
                            if (doctor) console.log('Found profile via userId endpoint');
                        }

                        // B. Fallback: Fetch all doctors and filter by normalized whatsappnumber
                        if (!doctor) {
                            console.log('Fallback: Filtering all doctors by normalized phone');
                            const allResponse = await fetch('https://appbookingbackend.onrender.com/api/doctor', {
                                method: 'GET',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });

                            if (allResponse.ok) {
                                const allData = await allResponse.json();
                                const allDoctors = allData.data?.doctors || allData.data || allData;
                                if (Array.isArray(allDoctors)) {
                                    doctor = allDoctors.find((d: any) => {
                                        const normalizedDPhone = normalizePhone(d.whatsappnumber);
                                        return normalizedDPhone === normalizedUserWhatsapp && normalizedUserWhatsapp !== '';
                                    });
                                    if (doctor) console.log('Found profile via normalized WhatsApp matching');
                                }
                            }
                        }

                        if (doctor && (doctor._id || doctor.id || doctor.doctorId)) {
                            console.log('Valid doctor profile linked:', doctor.name || doctor.email);
                            const foundDoctorId = doctor._id || doctor.id || doctor.doctorId;
                            await AsyncStorage.setItem('doctorId', foundDoctorId);
                            console.log('Stored doctorId in AsyncStorage:', foundDoctorId);

                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Main' }],
                            });
                        } else {
                            console.log('No valid doctor profile found, navigating to setup');
                            navigation.reset({
                                index: 0,
                                routes: [{
                                    name: 'DoctorProfileSetup',
                                    params: { userId: userId, token: token }
                                }],
                            });
                        }
                    } catch (error) {
                        console.error('Robust profile check failed:', error);
                        navigation.reset({
                            index: 0,
                            routes: [{
                                name: 'DoctorProfileSetup',
                                params: { userId: userId, token: token }
                            }],
                        });
                    }
                } else {
                    // Patient flow
                    try {
                        const userId = data.data?.userId || data.data?._id || data.userId;
                        const token = data.data?.accessToken || data.data?.token || data.token;
                        await AsyncStorage.setItem('userId', userId || '');
                        await AsyncStorage.setItem('token', token || '');
                        await AsyncStorage.setItem('role', userRole || 'patient');
                    } catch (storageError) {
                        console.error('Failed to store auth data:', storageError);
                    }

                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main' }],
                    });
                }
            } else {
                console.log('Login error response:', data);
                Alert.alert('Login Failed', data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login fetch error:', error);
            Alert.alert('Error', 'Network error or server unreachable');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <SafeAreaView edges={['top', 'left', 'right']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>MindEase</Text>
                            <Text style={styles.headerSubtitle}>{role} Portal Login</Text>
                        </View>
                        <View style={{ width: 24 }} />
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.card}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ marginTop: 20 }} />

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>WhatsApp Number</Text>
                            <View style={styles.phoneInputWrapper}>
                                <View style={styles.flagContainer}>
                                    <Text style={styles.flag}>🇵🇰</Text>
                                    <Text style={styles.countryCode}>+92</Text>
                                    <Icon name="chevron-down" size={12} color="#666" style={{ marginLeft: 4 }} />
                                </View>
                                <TextInput
                                    style={styles.phoneInput}
                                    placeholder="300 1234567"
                                    value={whatsapp}
                                    onChangeText={setWhatsapp}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>



                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                            </View>
                        </View>

                        <View style={styles.optionsRow}>
                            <TouchableOpacity
                                style={styles.rememberMeContainer}
                                onPress={() => setRememberMe(!rememberMe)}
                            >
                                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                                    {rememberMe && <Icon name="checkmark" size={12} color="#FFF" />}
                                </View>
                                <Text style={styles.rememberMeText}>Remember me</Text>
                            </TouchableOpacity>

                            <TouchableOpacity>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.loginButton, loading && { opacity: 0.7 }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.loginButtonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup', { role })}>
                                <Text style={styles.signupText}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3274A6', // Example Blue Color from image
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 30,
        paddingTop: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTextContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#F5F6F8', // Light grey background
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 0,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 20,
        flex: 1, // Take up remaining space or just content height
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 10,
        marginBottom: 24,
    },
    googleIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    googleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    googleButtonSubText: {
        fontSize: 12,
        color: '#666',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        marginHorizontal: 12,
        color: '#999',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        height: 48,
        backgroundColor: '#FFF',
        justifyContent: 'center',
    },
    input: {
        paddingHorizontal: 12,
        fontSize: 15,
        color: '#333',
    },
    phoneInputWrapper: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        height: 48,
        backgroundColor: '#FFF',
        alignItems: 'center',
    },
    flagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
        height: '100%',
    },
    flag: {
        fontSize: 18,
        marginRight: 6,
    },
    countryCode: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    phoneInput: {
        flex: 1,
        paddingHorizontal: 12,
        fontSize: 15,
        color: '#333',
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 8,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#999',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    checkboxChecked: {
        borderColor: '#3274A6',
        backgroundColor: '#3274A6',
    },
    rememberMeText: {
        color: '#666',
        fontSize: 14,
    },
    forgotPasswordText: {
        color: '#3274A6',
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: '#3274A6', // Matching header blue
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#3274A6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    signupText: {
        color: '#3274A6',
        fontSize: 14,
        fontWeight: '700',
    },
});

export default LoginScreen;
