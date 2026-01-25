import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const AppointmentScreen = () => {
    const slideAnim = useRef(new Animated.Value(-width)).current;

    useEffect(() => {
        const startAnimation = () => {
            slideAnim.setValue(-width);
            Animated.loop(
                Animated.timing(slideAnim, {
                    toValue: width,
                    duration: 4000, // Duration for one pass
                    useNativeDriver: true,
                })
            ).start();
        };

        startAnimation();
    }, [slideAnim]);

    return (
        <View style={styles.container}>
            <Animated.Text
                style={[
                    styles.text,
                    { transform: [{ translateX: slideAnim }] }
                ]}
            >
                YET TO BE COMPLETED
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'center', // Remove centering to let text slide across full width if needed, or keep it.
        // Actually, for sliding across screen, we handle position via translate.
        backgroundColor: '#fff',
        overflow: 'hidden', // Keep text inside screen bounds
    },
    text: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'red',
        position: 'absolute', // Position absolute to move freely
        alignSelf: 'center', // Center vertically effectively if container is flex:1 justify:center
    },
});

export default AppointmentScreen;
