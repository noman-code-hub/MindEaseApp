import React, { useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { createResponsiveStyles } from '../utils/responsive';

const AuthLoadingScreen = () => {
    const navigation = useNavigation<any>();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const role = await AsyncStorage.getItem('role');
                const userId = await AsyncStorage.getItem('userId');
                const doctorStatus = await AsyncStorage.getItem('doctorStatus'); // ACTIVE, PENDING, IN_PROGRESS

                console.log('--- AUTH LOADING SCREEN ---');
                console.log('Token:', token ? `${token.substring(0, 15)}...` : 'NULL/EMPTY');
                console.log('Role:', role);
                console.log('UserId:', userId);
                console.log('DoctorStatus:', doctorStatus);
                console.log('---------------------------');

                if (!token || token.trim() === '') {
                    console.log('No valid token found, redirecting to Main (guest mode)');
                    // No token found, go to Main as guest
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main' }],
                    });
                    return;
                }

                if (role?.toLowerCase() === 'doctor') {
                    // Check Doctor Status with normalization
                    const rawStatus = (doctorStatus || '').toUpperCase();
                    let normalizedStatus = 'IN_PROGRESS';

                    if (rawStatus === 'ACTIVE' || rawStatus === 'APPROVED') {
                        normalizedStatus = 'ACTIVE';
                    } else if (rawStatus === 'PENDING') {
                        normalizedStatus = 'PENDING';
                    }

                    console.log('User is a Doctor. Normalized status:', normalizedStatus);

                    if (normalizedStatus === 'PENDING') {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'PendingVerification' }],
                        });
                    } else if (normalizedStatus === 'IN_PROGRESS') {
                        navigation.reset({
                            index: 0,
                            routes: [{
                                name: 'DoctorProfileSetup',
                                params: { userId, token }
                            }],
                        });
                    } else {
                        // Default to Main (ACTIVE)
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Main' }],
                        });
                    }
                } else {
                    // Patient or other roles go to Main
                    console.log('User is a Patient (or other), redirecting to Main');
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Main' }],
                    });
                }
            } catch (error) {
                console.error('AuthLoading Error:', error);
                // Fallback to Main on error (guest mode)
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                });
            }
        };

        checkAuth();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <ActivityIndicator size="large" color="#5B7FFF" />
        </View>
    );
};

const styles = createResponsiveStyles({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AuthLoadingScreen;
