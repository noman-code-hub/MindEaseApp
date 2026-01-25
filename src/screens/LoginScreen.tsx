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

const LoginScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { role } = route.params || { role: 'Patient' };

    const [whatsapp, setWhatsapp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!whatsapp || !password) {
            // Alert is not imported yet, so we will use it via React Native default or standard alert if available, 
            // but checking the file imports, Alert is not imported. 
            // I will add Alert to imports in a separate edit or assume standard Alert.
            // Wait, looking at lines 2-11, Alert is NOT imported.
            // I should use a multi-replace or separate edits, or just add Alert to the replacement and imports.
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

            if (response.status === 200 || response.status === 201) {
                // Assuming successful login returns some user data or token
                // For now, navigating to Main
                // Check if role is doctor (Ideally backend should tell us if profile is incomplete)
                // For now, if current flow role is doctor, go to Setup.
                const userRole = data.data?.role || role; // Fallback to route param if API doesn't return role (it should)

                if (userRole && userRole.toLowerCase() === 'doctor') {
                    // Robustly extract userId
                    const userId = data.data?.userId || data.data?._id || data.data?.user?.userId || data.data?.user?._id || data.userId;

                    navigation.reset({
                        index: 0,
                        routes: [{
                            name: 'DoctorProfileSetup',
                            params: { userId: userId }
                        }],
                    });
                } else {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main' }],
                    });
                }
            } else {
                console.log('Login error data:', data);
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
                            <Text style={styles.label}>Email or Username</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
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

                        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                            <Text style={styles.loginButtonText}>Sign In</Text>
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
