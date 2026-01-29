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

const SignupScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { role } = (route.params as { role?: string }) || {};
    const safeRole = role || 'patient';

    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!phoneNumber || !password || !confirmPassword) {
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
            // If user enters 03001234567 -> 923001234567
            // If user enters 3001234567 -> 923001234567
            let formattedPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
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
                    role: safeRole
                }),
            });

            const data = await response.json();

            if (response.status === 201 || response.status === 200) {
                // API returns userId in data.userId, but checking others for robustness
                const userIdData = data.data?.userId || data.data?._id || data.data?.user?._id || data.userId;

                navigation.navigate('OtpVerification', {
                    userId: userIdData,
                    phoneNumber: phoneNumber,
                    receivedOtp: data.data.otp, // Passing the OTP received from backend
                    role: safeRole
                });
            } else {
                console.log('Registration error data:', data);
                Alert.alert('Registration Failed', data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error('Registration fetch error:', error);
            Alert.alert('Error', 'Network error or server unreachable');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>
                            Join us as a <Text style={styles.roleHighlight}>{safeRole}</Text>
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View style={styles.phoneInputWrapper}>
                                <View style={styles.countryCodeContainer}>
                                    <Text style={styles.countryCodeText}>+92</Text>
                                </View>
                                <TextInput
                                    style={styles.phoneInput}
                                    placeholder="300 1234567"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Icon name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Create a password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Icon
                                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.inputWrapper}>
                                <Icon name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Icon
                                        name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.signupButton, loading && styles.signupButtonDisabled]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.signupButtonText}>Sign Up</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login', { role: safeRole })}>
                                <Text style={styles.signupText}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    backButton: {
        marginBottom: 20,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    roleHighlight: {
        color: '#5B7FFF',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    form: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        backgroundColor: '#FAFAFA',
    },
    phoneInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        height: 50,
        backgroundColor: '#FAFAFA',
        overflow: 'hidden',
    },
    countryCodeContainer: {
        backgroundColor: '#EEF2FF',
        height: '100%',
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
    },
    countryCodeText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#333',
    },
    phoneInput: {
        flex: 1,
        height: '100%',
        color: '#333',
        paddingHorizontal: 12,
    },
    signupButton: {
        backgroundColor: '#5B7FFF',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10,
        shadowColor: '#5B7FFF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    signupButtonDisabled: {
        backgroundColor: '#A0B4F0',
    },
    signupButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    footerText: {
        color: '#666',
        fontSize: 15,
    },
    signupText: {
        color: '#5B7FFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
});

export default SignupScreen;
