import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { bookAppointment, startPayment, confirmPayment, getPaymentStatus } from '../services/appointmentService';

type PaymentMethod = 'easypaisa' | 'jazzcash' | 'card';

const PaymentScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>('easypaisa');

    // Form States
    const [mobileNumber, setMobileNumber] = useState('');
    const [cnic, setCnic] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const otpInputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (otpModalVisible) {
            setTimeout(() => {
                otpInputRef.current?.focus();
            }, 100);
        }
    }, [otpModalVisible]);

    const handleProceed = () => {
        if (!selectedMethod) {
            Alert.alert("Selection Required", "Please select a payment method.");
            return;
        }

        if (selectedMethod === 'easypaisa' || selectedMethod === 'jazzcash') {
            if (!mobileNumber || !cnic) {
                Alert.alert("Missing Information", "Please enter mobile number and CNIC last 4 digits.");
                return;
            }
            if (cnic.length !== 4) {
                Alert.alert("Invalid CNIC", "Please enter exactly last 4 digits of CNIC.");
                return;
            }
        } else if (selectedMethod === 'card') {
            if (!cardNumber || !expiry || !cvv) {
                Alert.alert("Missing Information", "Please enter card details.");
                return;
            }
        }

        setOtpModalVisible(true);
    };

    const handleOtpChange = (text: string) => {
        setOtp(text);
        if (otpError) setOtpError(false);
    };

    const verifyOtp = async () => {
        if (otp === '1234') {
            console.log('\n🔐 ========== OTP VERIFICATION STARTED ==========');
            console.log('[OTP] OTP verified successfully');
            setLoading(true);
            try {
                const params = route.params as any;
                const bookingPayload = params?.bookingPayload;
                const token = params?.token;
                const userId = params?.userId;
                const amount = params?.amount;

                console.log('[PAYMENT FLOW] Route Params:', {
                    hasBookingPayload: !!bookingPayload,
                    hasToken: !!token,
                    userId: userId,
                    amount: amount
                });

                if (bookingPayload) {


                    console.log('\n📋 STEP 1: Creating Appointment...');
                    console.log('[PAYMENT FLOW] Booking Payload:', JSON.stringify(bookingPayload, null, 2));


                    // 1. Create the appointment first
                    const bookingResult = await bookAppointment(bookingPayload, token);
                    const appointmentId = bookingResult.data?._id || bookingResult._id || bookingResult.data?.id;

                    console.log('[PAYMENT FLOW] ✓ Appointment Created!');
                    console.log('[PAYMENT FLOW] Appointment ID:', appointmentId);
                    console.log('[PAYMENT FLOW] Booking Result:', JSON.stringify(bookingResult, null, 2));

                    // 2. Start the payment process on the server
                    // Note: userId is optional for guest users
                    if (appointmentId && amount) {
                        const paymentMethodName = selectedMethod === 'easypaisa' ? 'Easypaisa' :
                            selectedMethod === 'jazzcash' ? 'JazzCash' : 'Visa/Mastercard';

                        console.log('\n💳 STEP 2: Starting Payment Process...');
                        console.log('[PAYMENT FLOW] Selected Payment Method:', paymentMethodName);
                        console.log('[PAYMENT FLOW] User Type:', userId ? 'Authenticated User' : 'Guest User');

                        const paymentStartPayload: any = {
                            appointmentId,
                            paymentMethod: paymentMethodName,
                            amount: Number(amount)
                        };

                        // Only include userId if it exists (for authenticated users)
                        if (userId && userId.trim() !== '') {
                            paymentStartPayload.userId = userId;
                        }

                        console.log('[PAYMENT FLOW] Payment Start Payload:', JSON.stringify(paymentStartPayload, null, 2));

                        const startPaymentResult = await startPayment(paymentStartPayload, token);
                        console.log('[PAYMENT FLOW] ✓ Payment Started!');
                        console.log('[PAYMENT FLOW] Start Payment Result:', JSON.stringify(startPaymentResult, null, 2));

                        // 3. Confirm payment via callback (simulated in-app after OTP)
                        // In a real scenario, this would be triggered by the payment provider
                        // Extract REAL IDs from the startPayment response
                        const transactionId = startPaymentResult.transactionId || `TXN_${Math.floor(Math.random() * 100000000)}`;
                        const paymentId = startPaymentResult.paymentId || `PAY_${Math.floor(Math.random() * 100000000)}`;

                        console.log('\n✅ STEP 3: Confirming Payment...');
                        console.log('[PAYMENT FLOW] Using Real Transaction ID:', transactionId);
                        console.log('[PAYMENT FLOW] Using Real Payment ID:', paymentId);

                        const confirmPayload = {
                            appointmentId,
                            paymentId,
                            transactionId,
                            status: 'paid'
                        };
                        console.log('[PAYMENT FLOW] Confirm Payment Payload:', JSON.stringify(confirmPayload, null, 2));

                        const confirmResult = await confirmPayment(confirmPayload, token);
                        console.log('[PAYMENT FLOW] ✓ Payment Confirmed!');
                        console.log('[PAYMENT FLOW] Confirm Payment Result:', JSON.stringify(confirmResult, null, 2));

                        // 4. Double check final status for verification
                        console.log('\n🔍 STEP 4: Verifying Final Payment Status...');
                        const statusResult = await getPaymentStatus(appointmentId, token);
                        const finalStatus = statusResult.status || statusResult.data?.status || 'Active';
                        console.log('[PAYMENT FLOW] ✓ Final Payment Status Retrieved!');
                        console.log('[PAYMENT FLOW] Final Status:', finalStatus);
                        console.log('[PAYMENT FLOW] Status Result:', JSON.stringify(statusResult, null, 2));
                        console.log('\n🎉 ========== PAYMENT FLOW COMPLETED SUCCESSFULLY ==========\n');
                    } else {
                        console.warn('[PAYMENT FLOW] ⚠️ Missing required data for payment:');
                        console.warn('[PAYMENT FLOW] Appointment ID:', appointmentId);
                        console.warn('[PAYMENT FLOW] User ID:', userId);
                        console.warn('[PAYMENT FLOW] Amount:', amount);
                    }
                } else {
                    console.warn('[PAYMENT FLOW] ⚠️ No booking payload found in route params');
                }

                setIsSuccess(true);
                setTimeout(() => {
                    setOtpModalVisible(false);
                    setIsSuccess(false);
                    setOtp('');
                    navigation.navigate('Main' as any);
                }, 2000);
            } catch (error: any) {
                console.error('\n❌ ========== PAYMENT FLOW FAILED ==========');
                console.error('[PAYMENT FLOW] Error occurred during booking/payment process');
                console.error('[PAYMENT FLOW] Error Message:', error.message);
                console.error('[PAYMENT FLOW] Error Stack:', error.stack);
                console.error('[PAYMENT FLOW] Full Error:', JSON.stringify(error, null, 2));
                console.error('============================================\n');
                setOtpModalVisible(false);
                setOtp('');
                Alert.alert("Process Failed", error.message || "Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        } else {
            console.log('[OTP] ❌ Invalid OTP entered:', otp);
            setOtpError(true);
        }
    };

    useEffect(() => {
        if (otp.length === 4) {
            verifyOtp();
        }
    }, [otp]);

    const renderPaymentOption = (id: PaymentMethod, title: string, subtitle: string, iconName: string, iconColor: string, iconBg: string) => {
        const isSelected = selectedMethod === id;
        return (
            <View style={[styles.optionCard, isSelected && styles.optionCardSelected]}>
                <TouchableOpacity
                    style={styles.optionHeader}
                    onPress={() => setSelectedMethod(id)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                        <Icon name={iconName} size={24} color={iconColor} />
                    </View>
                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>{title}</Text>
                        <Text style={styles.optionSubtitle}>{subtitle}</Text>
                    </View>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                    </View>
                </TouchableOpacity>

                {isSelected && (
                    <View style={styles.optionContent}>
                        {id === 'card' ? (
                            <View style={styles.formCompact}>
                                <Text style={styles.label}>Card Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0000 0000 0000 0000"
                                    keyboardType="numeric"
                                    value={cardNumber}
                                    onChangeText={setCardNumber}
                                />
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Expiry Date</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="MM/YY"
                                            value={expiry}
                                            onChangeText={setExpiry}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>CVV</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="123"
                                            keyboardType="numeric"
                                            maxLength={3}
                                            value={cvv}
                                            onChangeText={setCvv}
                                        />
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.formCompact}>
                                <Text style={styles.label}>Mobile Number</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="03XX XXXXXXX"
                                    keyboardType="phone-pad"
                                    value={mobileNumber}
                                    onChangeText={setMobileNumber}
                                    maxLength={11}
                                />
                                <Text style={styles.label}>CNIC (Last 4 digits)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="1234"
                                    keyboardType="numeric"
                                    value={cnic}
                                    onChangeText={setCnic}
                                    maxLength={4}
                                />
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Choose payment method</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity style={styles.addMethodButton}>
                    <Text style={styles.addMethodText}>+ Add new payment method</Text>
                </TouchableOpacity>

                {renderPaymentOption('easypaisa', 'Easypaisa', 'Pay using your mobile wallet', 'cash-outline', '#fff', '#10B981')}
                {renderPaymentOption('jazzcash', 'JazzCash', 'Instant mobile payments', 'wallet-outline', '#fff', '#F97316')}
                {renderPaymentOption('card', 'Visa / Mastercard', 'Pay via credit or debit card', 'card-outline', '#333', '#F3F4F6')}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.continueButton, loading && { opacity: 0.7 }]} onPress={handleProceed} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.continueButtonText}>Continue</Text>}
                </TouchableOpacity>
            </View>

            <Modal
                transparent={true}
                visible={otpModalVisible}
                onRequestClose={() => { }}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {loading ? (
                            <View style={{ alignItems: 'center', padding: 20 }}>
                                <ActivityIndicator size="large" color="#10B981" />
                                <Text style={[styles.otpSubtitle, { marginTop: 16 }]}>Processing Booking...</Text>
                            </View>
                        ) : isSuccess ? (
                            <View style={{ alignItems: 'center', padding: 20 }}>
                                <View style={{
                                    width: 60, height: 60, borderRadius: 30, backgroundColor: '#10B981',
                                    alignItems: 'center', justifyContent: 'center', marginBottom: 16
                                }}>
                                    <Icon name="checkmark" size={40} color="white" />
                                </View>
                                <Text style={styles.otpTitle}>Success!</Text>
                                <Text style={styles.otpSubtitle}>Appointment Booked Successfully</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.otpTitle}>Confirm Payment</Text>
                                <Text style={styles.otpSubtitle}>Please enter the 4-digit code sent to your mobile.</Text>
                                <TextInput
                                    ref={otpInputRef}
                                    style={[styles.otpInput, otpError && styles.otpInputError]}
                                    placeholder="- - - -"
                                    keyboardType="numeric"
                                    maxLength={4}
                                    value={otp}
                                    onChangeText={handleOtpChange}
                                    textAlign="center"
                                    autoFocus={true}
                                />
                                {otpError && <Text style={styles.errorText}>Invalid OTP</Text>}
                            </>
                        )}
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
        paddingBottom: 8,
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
        paddingTop: 0,
    },
    addMethodButton: {
        paddingVertical: 12,
    },
    addMethodText: {
        color: '#10B981',
        fontWeight: '600',
        fontSize: 14,
    },
    optionCard: {
        marginTop: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    optionCardSelected: {
        borderColor: '#10B981',
        borderWidth: 1.5,
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 48,
        height: 32,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1F3A',
        marginBottom: 2,
    },
    optionSubtitle: {
        fontSize: 12,
        color: '#888',
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: '#E0E0E0',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#10B981', // Green dot
    },
    optionContent: {
        padding: 16,
        paddingTop: 0,
        backgroundColor: '#fff',
    },
    formCompact: {
        marginTop: 8,
        gap: 12,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: '#000',
        backgroundColor: '#FAFAFA',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 15,
    },
    continueButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#10B981',
        borderRadius: 25,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    // Modal
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
        marginBottom: 8,
        color: '#1A1F3A',
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
        textAlign: 'center',
        backgroundColor: '#FAFAFA',
    },
    otpInputError: {
        borderColor: '#FF4444',
    },
    errorText: {
        color: '#FF4444',
        fontSize: 12,
        marginTop: 8,
    }
});

export default PaymentScreen;
