import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const WelcomeScreen = () => {
    const navigation = useNavigation();
    const [role, setRole] = useState<'patient' | 'doctor'>('patient');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    {/* Placeholder for an illustration */}
                    <View style={styles.placeholderCircle} />
                </View>

                <Text style={styles.title}>Welcome to MindEase</Text>
                <Text style={styles.subtitle}>
                    Your mental health journey starts here. Choose your role to get started.
                </Text>

                <View style={styles.roleContainer}>
                    <TouchableOpacity
                        style={[styles.roleButton, role === 'patient' && styles.roleButtonActive]}
                        onPress={() => setRole('patient')}
                    >
                        <Text style={[styles.roleText, role === 'patient' && styles.roleTextActive]}>Patient</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.roleButton, role === 'doctor' && styles.roleButtonActive]}
                        onPress={() => setRole('doctor')}
                    >
                        <Text style={[styles.roleText, role === 'doctor' && styles.roleTextActive]}>Doctor</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('Login', { role })}
                >
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.signupButton}
                    onPress={() => navigation.navigate('Signup', { role })}
                >
                    <Text style={styles.signupButtonText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    placeholderCircle: {
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: (width * 0.6) / 2,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    roleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 4,
        marginBottom: 30,
        width: '100%',
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    roleButtonActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    roleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888888',
    },
    roleTextActive: {
        color: '#5B7FFF',
    },
    loginButton: {
        width: '100%',
        backgroundColor: '#5B7FFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#5B7FFF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signupButton: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#5B7FFF',
    },
    signupButtonText: {
        color: '#5B7FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default WelcomeScreen;
