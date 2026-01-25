import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const OtpVerificationScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { userId, phoneNumber, receivedOtp, role } = (route.params as { userId: string, phoneNumber: string, receivedOtp?: string, role?: string }) || {};
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Auto-populate OTP if received from previous screen
    useEffect(() => {
        if (receivedOtp) {
            const otpString = String(receivedOtp);
            const otpArray = otpString.split('').slice(0, 6); // Ensure max 6 chars
            // Pad if less than 6 (though unlikely based on requirement)
            while (otpArray.length < 6) otpArray.push('');

            setOtp(otpArray);
        }
    }, [receivedOtp]);

    // Auto-verify when OTP is full
    useEffect(() => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length === 6 && !loading) {
            handleVerify();
        }
    }, [otp]);

    const handleChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto focus next input
        if (text && index < 5) {
            // Quick implementation for refs would be better, but simple state focus requires more boilerplate.
            // For now relying on user tap or simple focus management if possible.
            // Since we don't have refs setup for each input in this quick draft, user might need to tap next.
        }
    };

    const handleVerify = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('https://appbookingbackend.onrender.com/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    otp: enteredOtp,
                }),
            });

            const data = await response.json();

            if (response.status === 200 || response.status === 201) {
                // Check role passed from params (we need to ensure it's passed)
                // If not passed, we might default to Main, but let's try to get it.
                // Assuming we passed 'role' alongside userId.

                if (role && role.toLowerCase() === 'doctor') {
                    navigation.reset({
                        index: 0,
                        routes: [{
                            name: 'DoctorProfileSetup',
                            params: { userId: userId } // userId is already in scope
                        }],
                    });
                } else {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main' }],
                    });
                }
            } else {
                Alert.alert('Verification Failed', data.message || 'Invalid OTP');
            }

        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://appbookingbackend.onrender.com/api/auth/resend-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                }),
            });

            const data = await response.json();

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Success', 'Verification code resent successfully');
                setTimer(30);
            } else {
                Alert.alert('Error', data.message || 'Failed to resend code');
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            Alert.alert('Error', 'Network error or server unreachable');
        } finally {
            setLoading(false);
        }
    };

    // Helper to focus inputs (simplified for this iteration)
    // Real implementation would use useRef array

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Verification Code</Text>
                    <Text style={styles.subtitle}>
                        We have sent the code verification to your WhatsApp number
                    </Text>
                    <Text style={styles.phoneNumber}>{phoneNumber}</Text>
                </View>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            style={styles.otpInput}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                        />
                    ))}
                </View>

                <View style={styles.resendContainer}>
                    <TouchableOpacity onPress={handleResend} disabled={timer > 0 || loading}>
                        <Text style={[styles.resendText, (timer > 0 || loading) && { opacity: 0.5 }]}>
                            Didn't receive code?{' '}
                            <Text style={styles.timer}>
                                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.verifyButton, loading && styles.disabledButton]}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.verifyButtonText}>Verify</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 24,
    },
    backButton: {
        marginBottom: 20,
    },
    content: {
        flex: 1,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    phoneNumber: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        fontSize: 24,
        textAlign: 'center',
        backgroundColor: '#FAFAFA',
        color: '#333',
    },
    resendContainer: {
        marginBottom: 30,
    },
    resendText: {
        color: '#666',
        fontSize: 14,
    },
    timer: {
        color: '#5B7FFF',
        fontWeight: 'bold',
    },
    verifyButton: {
        backgroundColor: '#5B7FFF',
        width: '100%',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#5B7FFF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    disabledButton: {
        backgroundColor: '#A0B4F0',
    },
    verifyButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default OtpVerificationScreen;
