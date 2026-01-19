import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Modal,
    Alert,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

const PaymentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [mobileNumber, setMobileNumber] = useState('');
    const [cnic, setCnic] = useState('');
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState(false);

    // Auto-focus ref
    const otpInputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (otpModalVisible) {
            setTimeout(() => {
                otpInputRef.current?.focus();
            }, 100);
        }
    }, [otpModalVisible]);

    const handleProceed = () => {
        if (!mobileNumber || !cnic) {
            Alert.alert("Missing Information", "Please enter mobile number and CNIC last 4 digits.");
            return;
        }
        if (cnic.length !== 4) {
            Alert.alert("Invalid CNIC", "Please enter exactly last 4 digits of CNIC.");
            return;
        }
        setOtpModalVisible(true);
    };

    const handleOtpChange = (text: string) => {
        setOtp(text);
        if (otpError) setOtpError(false);
    };

    const verifyOtp = () => {
        if (otp === '1234') {
            setOtpModalVisible(false);
            Alert.alert(
                "Success",
                "Appointment Booked Successfully",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate('Home' as never)
                    }
                ]
            );
        } else {
            setOtpError(true);
        }
    };

    // Auto-verify when 4 digits are entered? Or wait for user?
    // Requirement says "Manual entry allowed", doesn't specify auto-submit. 
    // Usually OTP inputs verify auto or have a button. 
    // I can check useEffect for length 4.
    useEffect(() => {
        if (otp.length === 4) {
            verifyOtp();
            // Just verifying, if it's wrong it shows error.
            // If right it closes.
        }
    }, [otp]);


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#1A1F3A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment</Text>
            </View>

            <View style={styles.content}>
                {/* Order Summary (Optional but good) */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Booking Summary</Text>
                    {/* @ts-ignore */}
                    <Text style={styles.summaryText}>Doctor: {route.params?.doctorName || 'N/A'}</Text>
                    {/* @ts-ignore */}
                    <Text style={styles.summaryText}>Dept: {route.params?.doctorRole || 'N/A'}</Text>
                    {/* @ts-ignore */}
                    <Text style={styles.summaryText}>Fee: PKR 2000</Text>
                </View>

                {/* Payment Method */}
                <View style={styles.paymentMethod}>
                    <Text style={styles.label}>Selected Method</Text>
                    <View style={styles.methodCard}>
                        <View style={styles.radioSelected} />
                        <Text style={styles.methodText}>JazzCash</Text>
                        <Icon name="cash-outline" size={24} color="#E0115F" style={{ marginLeft: 'auto' }} />
                    </View>
                </View>

                {/* Form Inputs */}
                <View style={styles.form}>
                    <Text style={styles.label}>JazzCash Mobile Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="03XX-XXXXXXX"
                        keyboardType="phone-pad"
                        value={mobileNumber}
                        onChangeText={setMobileNumber}
                        maxLength={11}
                    />

                    <Text style={styles.label}>CNIC (Last 4 Digits)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="XXXX"
                        keyboardType="numeric"
                        value={cnic}
                        onChangeText={setCnic}
                        maxLength={4}
                    />
                </View>

                <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
                    <Text style={styles.proceedButtonText}>Proceed to OTP</Text>
                </TouchableOpacity>
            </View>

            {/* OTP Modal */}
            <Modal
                transparent={true}
                visible={otpModalVisible}
                onRequestClose={() => { }} // Block back button close
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.otpTitle}>Enter OTP</Text>
                        <Text style={styles.otpSubtitle}>Please enter the 4-digit code sent to your mobile.</Text>

                        <TextInput
                            ref={otpInputRef}
                            style={[
                                styles.otpInput,
                                otpError && styles.otpInputError
                            ]}
                            placeholder="- - - -"
                            keyboardType="numeric"
                            maxLength={4}
                            value={otp}
                            onChangeText={handleOtpChange}
                            textAlign="center"
                            autoFocus={true} // Also set ref focus just in case
                        />
                        {otpError && <Text style={styles.errorText}>Invalid OTP</Text>}
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1F3A',
    },
    content: {
        padding: 20,
    },
    summaryCard: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1F3A',
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    paymentMethod: {
        marginBottom: 24,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: '#5B7FFF',
        backgroundColor: '#E8EFFF',
        borderRadius: 12,
    },
    radioSelected: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 5,
        borderColor: '#5B7FFF',
        marginRight: 12,
        backgroundColor: 'white'
    },
    methodText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1F3A',
    },
    form: {
        gap: 16,
        marginBottom: 32,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: '#000',
        backgroundColor: '#FAFAFA',
    },
    proceedButton: {
        backgroundColor: '#5B7FFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#5B7FFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    proceedButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        width: '80%',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 5,
    },
    otpTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1F3A',
        marginBottom: 8,
    },
    otpSubtitle: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    otpInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 12,
        fontSize: 24,
        letterSpacing: 8,
        color: '#1A1F3A',
        backgroundColor: '#FAFAFA',
        fontWeight: '600',
    },
    otpInputError: {
        borderColor: '#FF4444',
        borderWidth: 1.5,
    },
    errorText: {
        color: '#FF4444',
        fontSize: 12,
        marginTop: 8,
        fontWeight: '500',
    }
});

export default PaymentScreen;
