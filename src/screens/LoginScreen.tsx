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
import AppInput from '../components/AppInput';
import { DoctorStatus } from '../types/enums';

const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { role } = (route.params as { role?: string }) || { role: undefined };
    const safeRole = role || 'Patient';

    const [selectedRole, setSelectedRole] = useState<string>(role || 'Patient'); // User-selected role
    const [isLogin, setIsLogin] = useState(true); // Toggle State

    const [whatsapp, setWhatsapp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [loading, setLoading] = useState(false);

    const toggleAuthMode = (mode: boolean) => {
        setIsLogin(mode);
        // Clear sensitive fields when switching
        setPassword('');
        setConfirmPassword('');
    };

    const handleAuthAction = async () => {
        if (isLogin) {
            handleLogin();
        } else {
            handleSignup();
        }
    };

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

                    // Store auth data
                    await AsyncStorage.setItem('userId', userId || '');
                    await AsyncStorage.setItem('token', token || '');
                    await AsyncStorage.setItem('role', userRole);
                    await AsyncStorage.setItem('whatsappnumber', userWhatsapp);

                    // Robust check for doctor profile
                    await AsyncStorage.removeItem('doctorId');
                    let doctor = null;

                    const normalizePhone = (phone: string | undefined): string => {
                        if (!phone) return '';
                        let clean = phone.replace(/\D/g, '');
                        if (clean.startsWith('92')) clean = clean.substring(2);
                        if (clean.startsWith('0')) clean = clean.substring(1);
                        return clean;
                    };

                    const normalizedUserWhatsapp = normalizePhone(userWhatsapp);

                    // Try profile endpoint
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
                        if (Array.isArray(doctor)) doctor = doctor[0];
                    }

                    if (!doctor) {
                        const allResponse = await fetch('https://appbookingbackend.onrender.com/api/doctor', {
                            method: 'GET',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        if (allResponse.ok) {
                            const allData = await allResponse.json();
                            const allDoctors = allData.data?.doctors || allData.data || allData;
                            if (Array.isArray(allDoctors)) {
                                doctor = allDoctors.find((d: any) => normalizePhone(d.whatsappnumber) === normalizedUserWhatsapp && normalizedUserWhatsapp !== '');
                            }
                        }
                    }

                    if (doctor && (doctor._id || doctor.id)) {
                        const foundDoctorId = doctor._id || doctor.id || doctor.doctorId;
                        await AsyncStorage.setItem('doctorId', foundDoctorId);
                        const doctorStatus = (doctor.status || DoctorStatus.ACTIVE).toUpperCase();
                        await AsyncStorage.setItem('doctorStatus', doctorStatus);

                        if (doctorStatus === DoctorStatus.PENDING) {
                            navigation.reset({ index: 0, routes: [{ name: 'PendingVerification' as any }] });
                        } else if (doctorStatus === DoctorStatus.IN_PROGRESS) {
                            navigation.reset({ index: 0, routes: [{ name: 'DoctorProfileSetup' as any, params: { userId, token } as any }] });
                        } else {
                            navigation.reset({ index: 0, routes: [{ name: 'Main' as any }] });
                        }
                    } else {
                        navigation.reset({ index: 0, routes: [{ name: 'DoctorProfileSetup' as any, params: { userId, token } as any }] });
                    }
                } else {
                    // Patient flow
                    const userId = data.data?.userId || data.data?._id || data.userId;
                    const token = data.data?.accessToken || data.data?.token || data.token;
                    await AsyncStorage.setItem('userId', userId || '');
                    await AsyncStorage.setItem('token', token || '');
                    await AsyncStorage.setItem('role', userRole || 'patient');
                    navigation.reset({ index: 0, routes: [{ name: 'Main' as any }] });
                }
            } else {
                Alert.alert('Login Failed', data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Network error or server unreachable');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        if (!whatsapp || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            // Format phone number: Remove leading 0 if present, and prepend 92
            let formattedPhone = whatsapp.replace(/\D/g, ''); // Remove non-digits
            if (formattedPhone.startsWith('0')) {
                formattedPhone = formattedPhone.substring(1);
            }
            if (!formattedPhone.startsWith('92')) {
                formattedPhone = '92' + formattedPhone;
            }

            const response = await fetch('https://appbookingbackend.onrender.com/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    whatsappnumber: formattedPhone, // formatted number
                    password: password,
                    role: selectedRole.toLowerCase()
                }),
            });

            const data = await response.json();

            if (response.status === 201 || response.status === 200) {
                // API returns userId in data.userId, but checking others for robustness
                const userIdData = data.data?.userId || data.data?._id || data.data?.user?._id || data.userId;

                navigation.navigate('OtpVerification', {
                    userId: userIdData,
                    phoneNumber: whatsapp,
                    receivedOtp: data.data.otp, // Passing the OTP received from backend
                    role: safeRole.toLowerCase()
                });
            } else {
                Alert.alert('Registration Failed', data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error('Registration error:', error);
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
                            {role ? (
                                <Text style={styles.headerSubtitle}>{safeRole} Portal</Text>
                            ) : (
                                <View style={styles.roleSelector}>
                                    <TouchableOpacity
                                        style={[styles.roleOption, selectedRole === 'Patient' && styles.roleOptionActive]}
                                        onPress={() => setSelectedRole('Patient')}
                                    >
                                        <Text style={[styles.roleOptionText, selectedRole === 'Patient' && styles.roleOptionTextActive]}>Patient</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.roleOption, selectedRole === 'Doctor' && styles.roleOptionActive]}
                                        onPress={() => setSelectedRole('Doctor')}
                                    >
                                        <Text style={[styles.roleOptionText, selectedRole === 'Doctor' && styles.roleOptionTextActive]}>Doctor</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <View style={{ width: 24 }} />
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.card}>
                    {/* TOGGLE SWITCH */}
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
                            onPress={() => toggleAuthMode(true)}
                        >
                            <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
                            onPress={() => toggleAuthMode(false)}
                        >
                            <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>

                        <View style={{ marginTop: 20 }} />

                        <AppInput
                            label="WhatsApp Number"
                            placeholder="300 1234567"
                            value={whatsapp}
                            onChangeText={setWhatsapp}
                            keyboardType="phone-pad"
                            leftElement={
                                <View style={styles.countryCodeContainer}>
                                    <Text style={styles.countryCodeText}>+92</Text>
                                </View>
                            }
                        />

                        <AppInput
                            label="Password"
                            placeholder={isLogin ? "Enter your password" : "Create a password"}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            icon="lock-closed-outline"
                            rightElement={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Icon name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                                </TouchableOpacity>
                            }
                        />

                        {/* Sign Up Only Fields */}
                        {!isLogin && (
                            <AppInput
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                icon="lock-closed-outline"
                                rightElement={
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <Icon name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                                    </TouchableOpacity>
                                }
                            />
                        )}

                        {/* Login Only Options */}
                        {isLogin && (
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
                        )}

                        <TouchableOpacity
                            style={[styles.actionButton, loading && { opacity: 0.7 }]}
                            onPress={handleAuthAction}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.actionButtonText}>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View style={{ marginBottom: 20 }} />
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
        borderTopLeftRadius: 20, // Increased radius
        borderTopRightRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 24, // Increased padding
        paddingBottom: 0,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16, // Softer corners
        padding: 24,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F0F2F5',
        borderRadius: 12,
        padding: 4,
        marginBottom: 10,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    toggleButtonActive: {
        backgroundColor: '#FFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8898AA',
    },
    toggleTextActive: {
        color: '#3274A6',
        fontWeight: '700',
    },
    countryCodeContainer: {
        backgroundColor: '#F1F5F9',
        height: '100%',
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
    },
    countryCodeText: {
        fontSize: 15,
        color: '#1A1F3A',
        fontWeight: '700',
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
    actionButton: {
        backgroundColor: '#3274A6', // Matching header blue
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20, // Adjusted margin
        shadowColor: '#3274A6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 10,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    roleSelector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 3,
        marginTop: 4,
    },
    roleOption: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 16,
        minWidth: 80,
        alignItems: 'center',
    },
    roleOptionActive: {
        backgroundColor: '#FFFFFF',
    },
    roleOptionText: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    roleOptionTextActive: {
        color: '#3274A6',
    },
});

export default LoginScreen;
