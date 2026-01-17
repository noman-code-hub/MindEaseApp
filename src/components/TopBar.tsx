import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, StatusBar, Animated, Dimensions, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const TopBar = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    // Animation values
    const bgFadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(height)).current;

    // Staggered animations for items
    const item1Anim = useRef(new Animated.Value(50)).current; // TranslateY
    const item1Op = useRef(new Animated.Value(0)).current;    // Opacity

    const item2Anim = useRef(new Animated.Value(50)).current;
    const item2Op = useRef(new Animated.Value(0)).current;

    const item3Anim = useRef(new Animated.Value(50)).current;
    const item3Op = useRef(new Animated.Value(0)).current;

    const item4Anim = useRef(new Animated.Value(50)).current;
    const item4Op = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (modalVisible) {
            // Reset items
            item1Anim.setValue(50); item1Op.setValue(0);
            item2Anim.setValue(50); item2Op.setValue(0);
            item3Anim.setValue(50); item3Op.setValue(0);
            item4Anim.setValue(50); item4Op.setValue(0);

            Animated.sequence([
                // 1. Fade in BG & Slide Up Container
                Animated.parallel([
                    Animated.timing(bgFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
                ]),
                // 2. Stagger items
                Animated.stagger(100, [
                    Animated.parallel([
                        Animated.spring(item1Anim, { toValue: 0, friction: 6, useNativeDriver: true }),
                        Animated.timing(item1Op, { toValue: 1, duration: 200, useNativeDriver: true })
                    ]),
                    Animated.parallel([
                        Animated.spring(item2Anim, { toValue: 0, friction: 6, useNativeDriver: true }),
                        Animated.timing(item2Op, { toValue: 1, duration: 200, useNativeDriver: true })
                    ]),
                    Animated.parallel([
                        Animated.spring(item3Anim, { toValue: 0, friction: 6, useNativeDriver: true }),
                        Animated.timing(item3Op, { toValue: 1, duration: 200, useNativeDriver: true })
                    ]),
                    Animated.parallel([
                        Animated.spring(item4Anim, { toValue: 0, friction: 6, useNativeDriver: true }),
                        Animated.timing(item4Op, { toValue: 1, duration: 200, useNativeDriver: true })
                    ]),
                ])
            ]).start();

        } else {
            // Close animation
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }),
                Animated.timing(bgFadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
            ]).start();
        }
    }, [modalVisible]);

    const handleNavigation = (screenName: string) => {
        closeMenu(() => {
            // @ts-ignore
            navigation.navigate(screenName);
        });
    };

    const closeMenu = (callback?: () => void) => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.in(Easing.exp)
            }),
            Animated.timing(bgFadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setModalVisible(false);
            if (callback) callback();
        });
    };

    const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <View style={styles.contentContainer}>
                <Text style={styles.title}>MindEase</Text>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={styles.menuButton}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Icon name="menu" size={32} color="#333" />
                </TouchableOpacity>
            </View>

            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => closeMenu()}
            >
                <Animated.View style={[styles.modalContainer, { opacity: bgFadeAnim }]}>
                    <Animated.View style={[
                        styles.menuContent,
                        { transform: [{ translateY: slideAnim }] }
                    ]}>
                        {/* Background Decorative Circles */}
                        <View style={styles.circle1} />
                        <View style={styles.circle2} />

                        <TouchableOpacity
                            style={[styles.closeButton, { top: insets.top + 20 }]}
                            onPress={() => closeMenu()}
                        >
                            <Icon name="close" size={32} color="#FFFFFF" />
                        </TouchableOpacity>

                        <View style={styles.menuItemsContainer}>

                            <AnimatedTouchableOpacity
                                style={[styles.fullScreenMenuItem, { opacity: item1Op, transform: [{ translateY: item1Anim }] }]}
                                onPress={() => handleNavigation('Profile')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(91, 127, 255, 0.2)' }]}>
                                    <Icon name="person" size={24} color="#5B7FFF" />
                                </View>
                                <Text style={styles.fullScreenMenuText}>Profile</Text>
                                <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" style={{ marginLeft: 'auto' }} />
                            </AnimatedTouchableOpacity>

                            <AnimatedTouchableOpacity
                                style={[styles.fullScreenMenuItem, { opacity: item2Op, transform: [{ translateY: item2Anim }] }]}
                                onPress={() => handleNavigation('Plans')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(78, 205, 196, 0.2)' }]}>
                                    <Icon name="calendar" size={24} color="#4ECDC4" />
                                </View>
                                <Text style={styles.fullScreenMenuText}>Appointment</Text>
                                <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" style={{ marginLeft: 'auto' }} />
                            </AnimatedTouchableOpacity>

                            <AnimatedTouchableOpacity
                                style={[styles.fullScreenMenuItem, { opacity: item3Op, transform: [{ translateY: item3Anim }] }]}
                                onPress={() => handleNavigation('Plans')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(167, 139, 250, 0.2)' }]}>
                                    <Icon name="list" size={24} color="#A78BFA" />
                                </View>
                                <Text style={styles.fullScreenMenuText}>Plan</Text>
                                <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" style={{ marginLeft: 'auto' }} />
                            </AnimatedTouchableOpacity>

                            <AnimatedTouchableOpacity
                                style={[styles.fullScreenMenuItem, { opacity: item4Op, transform: [{ translateY: item4Anim }] }]}
                                onPress={() => handleNavigation('Home')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 107, 157, 0.2)' }]}>
                                    <Icon name="flash" size={24} color="#FF6B9D" />
                                </View>
                                <Text style={styles.fullScreenMenuText}>Action</Text>
                                <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" style={{ marginLeft: 'auto' }} />
                            </AnimatedTouchableOpacity>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>MindEase Premium Care</Text>
                        </View>
                    </Animated.View>
                </Animated.View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 100,
        width: '100%',
    },
    contentContainer: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    menuButton: {
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1F3A',
        letterSpacing: 0.5,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0)',
    },
    menuContent: {
        flex: 1,
        backgroundColor: '#111425', // Darker Premium BG
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 30, // Rounded top corners
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    circle1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#1A1F3A',
        opacity: 0.5,
    },
    circle2: {
        position: 'absolute',
        bottom: -150,
        left: -50,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#1A1F3A',
        opacity: 0.4,
    },
    closeButton: {
        position: 'absolute',
        right: 25,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 22,
        zIndex: 20,
    },
    menuItemsContainer: {
        width: '100%',
        paddingHorizontal: 30,
        gap: 20,
    },
    fullScreenMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    fullScreenMenuText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    footer: {
        position: 'absolute',
        bottom: 60,
        width: '100%',
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});

export default TopBar;
