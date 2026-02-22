import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Dimensions,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthState } from '../navigation/authState';

const { width } = Dimensions.get('window');

const PendingVerificationScreen = ({ onRefresh }: { onRefresh?: () => void }) => {
    const { signIn, signOut } = useAuthState();
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    React.useEffect(() => {
        console.log('[PendingVerificationScreen] Component mounted and rendering!');
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Fetch latest status from API
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');

            if (userId && token) {
                console.log('[REFRESH] Fetching latest doctor status...');
                const response = await fetch(`https://appbookingbackend.onrender.com/api/doctor/profile/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();

                    console.log('--- REFRESH STATUS DEBUG ---');
                    console.log('API Raw Response:', JSON.stringify(data, null, 2));
                    console.log('data.data?.status:', data.data?.status);
                    console.log('data.doctor?.status:', data.doctor?.status);
                    console.log('data.status:', data.status);

                    const latestStatus = (data.data?.status || data.status || data.doctor?.status || '').toUpperCase();
                    console.log('[REFRESH] Final Extracted Status:', latestStatus);
                    console.log('----------------------------');

                    await AsyncStorage.setItem('doctorStatus', latestStatus);

                    if (latestStatus === 'ACTIVE') {
                        console.log('[REFRESH] Doctor approved! Switching to authenticated flow');
                        Alert.alert('Approved!', 'Your profile has been approved. Welcome to MindEase!', [
                            {
                                text: 'Continue',
                                onPress: () => signIn(),
                            }
                        ]);
                    } else {
                        Alert.alert('Still Pending', 'Your profile is still under review. We\'ll notify you once approved.');
                    }
                } else {
                    Alert.alert('Error', 'Failed to check status. Please try again later.');
                }
            }
        } catch (error) {
            console.error('[REFRESH] Error:', error);
            Alert.alert('Error', 'Failed to check status. Please try again later.');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1A1F3A" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.mainContent}>
                    {/* Top Aesthetic Element */}
                    <View style={styles.decorationCircle} />

                    <View style={styles.card}>
                        <View style={styles.iconWrapper}>
                            <View style={styles.iconPulse}>
                                <Icon name="shield-checkmark" size={60} color="#FFF" />
                            </View>
                        </View>

                        <Text style={styles.title}>Account Under Review</Text>

                        <View style={styles.divider} />

                        <Text style={styles.message}>
                            Your professional profile is currently being verified by our administrative team.
                        </Text>

                        <View style={styles.infoBox}>
                            <Icon name="information-circle-outline" size={20} color="#5B7FFF" />
                            <Text style={styles.infoText}>
                                This process usually takes 1-2 business days. We will notify you once you're approved.
                            </Text>
                        </View>

                        <Text style={styles.subMessage}>
                            Thank you for your patience while we ensure the highest standards for our Specialists network.
                        </Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.refreshButton, isRefreshing && { opacity: 0.7 }]}
                                activeOpacity={0.8}
                                onPress={handleRefresh}
                                disabled={isRefreshing}
                            >
                                <Icon name="sync-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.refreshButtonText}>
                                    {isRefreshing ? 'Checking...' : 'Refresh Application'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.logoutButton}
                                activeOpacity={0.6}
                                onPress={handleLogout}
                            >
                                <Text style={styles.logoutButtonText}>Sign Out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.footerVersion}>MindEase Specialist Portal • v1.0.2</Text>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1F3A', // Deep primary blue
    },
    safeArea: {
        flex: 1,
    },
    decorationCircle: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(91, 127, 255, 0.1)',
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    iconWrapper: {
        marginBottom: 24,
    },
    iconPulse: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#5B7FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#5B7FFF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1A1F3A',
        marginBottom: 8,
        textAlign: 'center',
    },
    divider: {
        width: 40,
        height: 4,
        backgroundColor: '#5B7FFF',
        borderRadius: 2,
        marginBottom: 20,
    },
    message: {
        fontSize: 17,
        color: '#2D3436',
        textAlign: 'center',
        lineHeight: 26,
        fontWeight: '600',
        marginBottom: 20,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#F0F7FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 10,
        lineHeight: 20,
    },
    subMessage: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 32,
    },
    buttonContainer: {
        width: '100%',
    },
    refreshButton: {
        backgroundColor: '#5B7FFF',
        flexDirection: 'row',
        width: '100%',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#5B7FFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    refreshButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    logoutButton: {
        width: '100%',
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    logoutButtonText: {
        color: '#6B7280',
        fontSize: 15,
        fontWeight: '600',
    },
    footerVersion: {
        position: 'absolute',
        bottom: 20,
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: 1,
    },
});

export default PendingVerificationScreen;
