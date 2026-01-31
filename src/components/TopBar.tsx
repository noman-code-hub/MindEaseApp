import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, StatusBar, Animated, Dimensions, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const TopBar = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('token');
            setIsLoggedIn(!!token);
        };
        if (modalVisible) {
            checkAuth();
        }
    }, [modalVisible]);

    // Animation values
    const bgFadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(width)).current; // Start off-screen right

    // Staggered animations for items
    const item1Anim = useRef(new Animated.Value(50)).current; // TranslateY inside
    const item1Op = useRef(new Animated.Value(0)).current;

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
                // 1. Fade in BG & Slide In Container (From Right)
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
                Animated.timing(slideAnim, { toValue: width, duration: 250, useNativeDriver: true }),
                Animated.timing(bgFadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
            ]).start();
        }
    }, [modalVisible]);

    const handleNavigation = (screenName: string, params?: any) => {
        closeMenu(() => {
            // @ts-ignore
            navigation.navigate(screenName, params);
        });
    };

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(['token', 'userId', 'role', 'doctorId', 'whatsappnumber']);
        setIsLoggedIn(false);
        closeMenu(() => {
            // @ts-ignore
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        });
    };

    const closeMenu = (callback?: () => void) => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: width,
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
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <View style={styles.contentContainer}>
                <Text style={styles.title}>MindEase</Text>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={styles.menuButton}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Icon name="menu" size={32} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => closeMenu()}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => closeMenu()} activeOpacity={1} />
                    <Animated.View style={[
                        styles.menuContent,
                        { transform: [{ translateX: slideAnim }] }
                    ]}>
                        {/* Background Decorative Circles */}
                        <View style={styles.circle1} />
                        <View style={styles.circle2} />

                        <TouchableOpacity
                            style={[styles.closeButton, { top: insets.top + 20 }]}
                            onPress={() => closeMenu()}
                        >
                            <Icon name="close" size={28} color="#1A1F3A" />
                        </TouchableOpacity>

                        <View style={styles.menuHeader}>
                            <Text style={styles.menuTitle}>Menu</Text>
                        </View>

                        <View style={styles.menuItemsContainer}>

                            <AnimatedTouchableOpacity
                                style={[styles.fullScreenMenuItem, { opacity: item1Op, transform: [{ translateY: item1Anim }] }]}
                                onPress={() => handleNavigation('Profile')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBox, { backgroundColor: '#E8EFFF' }]}>
                                    <Icon name="person" size={24} color="#5B7FFF" />
                                </View>
                                <Text style={styles.fullScreenMenuText}>Profile</Text>
                                <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                            </AnimatedTouchableOpacity>

                            <AnimatedTouchableOpacity
                                style={[styles.fullScreenMenuItem, { opacity: item2Op, transform: [{ translateY: item2Anim }] }]}
                                onPress={() => handleNavigation('Plans')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBox, { backgroundColor: '#E0F7F5' }]}>
                                    <Icon name="calendar" size={24} color="#4ECDC4" />
                                </View>
                                <Text style={styles.fullScreenMenuText}>Appointment</Text>
                                <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                            </AnimatedTouchableOpacity>

                            <AnimatedTouchableOpacity
                                style={[styles.fullScreenMenuItem, { opacity: item3Op, transform: [{ translateY: item3Anim }] }]}
                                onPress={() => handleNavigation('Plans')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBox, { backgroundColor: '#F3EFFF' }]}>
                                    <Icon name="list" size={24} color="#A78BFA" />
                                </View>
                                <Text style={styles.fullScreenMenuText}>Plan</Text>
                                <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                            </AnimatedTouchableOpacity>

                            <AnimatedTouchableOpacity
                                style={[styles.fullScreenMenuItem, { opacity: item4Op, transform: [{ translateY: item4Anim }] }]}
                                onPress={() => handleNavigation('Home')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBox, { backgroundColor: '#FFF0F5' }]}>
                                    <Icon name="flash" size={24} color="#FF6B9D" />
                                </View>
                                <Text style={styles.fullScreenMenuText}>Action</Text>
                                <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                            </AnimatedTouchableOpacity>

                            {!isLoggedIn ? (
                                <>
                                    <AnimatedTouchableOpacity
                                        style={[styles.fullScreenMenuItem, { opacity: item1Op, transform: [{ translateY: item1Anim }] }]}
                                        onPress={() => handleNavigation('Signup', { role: 'doctor' })}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                                            <Icon name="medical" size={24} color="#5B7FFF" />
                                        </View>
                                        <Text style={styles.fullScreenMenuText}>Join as Doctor</Text>
                                        <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                                    </AnimatedTouchableOpacity>

                                    <AnimatedTouchableOpacity
                                        style={[styles.fullScreenMenuItem, { opacity: item2Op, transform: [{ translateY: item2Anim }] }]}
                                        onPress={() => handleNavigation('Signup', { role: 'patient' })}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                                            <Icon name="person-add" size={24} color="#10B981" />
                                        </View>
                                        <Text style={styles.fullScreenMenuText}>Join as Patient</Text>
                                        <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                                    </AnimatedTouchableOpacity>
                                </>
                            ) : (
                                <AnimatedTouchableOpacity
                                    style={[styles.fullScreenMenuItem, { opacity: item1Op, transform: [{ translateY: item1Anim }] }]}
                                    onPress={handleLogout}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                                        <Icon name="log-out" size={24} color="#EF4444" />
                                    </View>
                                    <Text style={styles.fullScreenMenuText}>Logout</Text>
                                    <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                                </AnimatedTouchableOpacity>
                            )}
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>MindEase Premium Care</Text>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#5B7FFF', // Primary Blue
        elevation: 4,
        shadowColor: '#5B7FFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
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
        color: '#FFFFFF', // White Text
        letterSpacing: 0.5,
    },
    modalOverlay: {
        flex: 1,
        flexDirection: 'row',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    menuContent: {
        width: '80%', // Right Sidebar
        backgroundColor: '#FFFFFF', // White Sidebar
        height: '100%',
        borderTopLeftRadius: 30, // Rounded left corners
        borderBottomLeftRadius: 30,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: -5, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    circle1: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#F0F4FF', // Light Blue Decoration
        opacity: 0.8,
    },
    circle2: {
        position: 'absolute',
        bottom: -150,
        left: -50,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#F0F4FF',
        opacity: 0.6,
    },
    closeButton: {
        position: 'absolute',
        right: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        zIndex: 20,
    },
    menuHeader: {
        marginTop: 60,
        paddingHorizontal: 30,
        marginBottom: 20,
    },
    menuTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1A1F3A',
        letterSpacing: 0.5,
    },
    menuItemsContainer: {
        width: '100%',
        paddingHorizontal: 20,
        gap: 16,
    },
    fullScreenMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        // Neumorphic
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    fullScreenMenuText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1F3A', // Dark Text
        letterSpacing: 0.5,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        alignItems: 'center',
    },
    footerText: {
        color: '#999',
        fontSize: 10,
        letterSpacing: 2,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
});

export default TopBar;
