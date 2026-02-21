import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, StatusBar, Animated, Dimensions, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const TopBar = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userProfile, setUserProfile] = useState<{ name: string, role: string, avatar?: string } | null>(null);
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('token');
            const role = await AsyncStorage.getItem('role');
            setIsLoggedIn(!!token);
            if (token) {
                fetchUserProfile(token, role);
            } else {
                setUserProfile(null);
            }
        };
        checkAuth();
    }, [modalVisible]);

    const fetchUserProfile = async (token: string, role: string | null) => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const doctorId = await AsyncStorage.getItem('doctorId');

            let name = 'User';
            let displayRole = role || 'Patient';

            if (role?.toLowerCase() === 'doctor') {
                displayRole = 'Doctor';
                const idToUse = doctorId || userId;
                if (idToUse) {
                    const response = await fetch(`https://appbookingbackend.onrender.com/api/doctor/profile/${userId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        const doctor = data.data || data.doctor || (Array.isArray(data) ? data[0] : data);
                        name = doctor?.name || name;
                    }
                }
            } else {
                displayRole = 'Patient';
                const response = await fetch(`https://appbookingbackend.onrender.com/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const user = data.data || data.user || data;
                    name = user?.name || name;
                }
            }

            setUserProfile({ name, role: displayRole });
        } catch (error) {
            console.error('Error fetching user profile for TopBar:', error);
        }
    };

    // Animation values
    const bgFadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-width)).current; // Start off-screen left

    // Staggered animations for items
    const item1Anim = useRef(new Animated.Value(50)).current;
    const item1Op = useRef(new Animated.Value(0)).current;
    const item2Anim = useRef(new Animated.Value(50)).current;
    const item2Op = useRef(new Animated.Value(0)).current;
    const item3Anim = useRef(new Animated.Value(50)).current;
    const item3Op = useRef(new Animated.Value(0)).current;
    const item4Anim = useRef(new Animated.Value(50)).current;
    const item4Op = useRef(new Animated.Value(0)).current;
    const item5Anim = useRef(new Animated.Value(50)).current;
    const item5Op = useRef(new Animated.Value(0)).current;
    const item6Anim = useRef(new Animated.Value(50)).current;
    const item6Op = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (modalVisible) {
            // Reset items
            item1Anim.setValue(50); item1Op.setValue(0);
            item2Anim.setValue(50); item2Op.setValue(0);
            item3Anim.setValue(50); item3Op.setValue(0);
            item4Anim.setValue(50); item4Op.setValue(0);
            item5Anim.setValue(50); item5Op.setValue(0);
            item6Anim.setValue(50); item6Op.setValue(0);

            Animated.sequence([
                // 1. Fade in BG & Slide In Container (From Left)
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
                    Animated.parallel([
                        Animated.spring(item5Anim, { toValue: 0, friction: 6, useNativeDriver: true }),
                        Animated.timing(item5Op, { toValue: 1, duration: 200, useNativeDriver: true })
                    ]),
                    Animated.parallel([
                        Animated.spring(item6Anim, { toValue: 0, friction: 6, useNativeDriver: true }),
                        Animated.timing(item6Op, { toValue: 1, duration: 200, useNativeDriver: true })
                    ]),
                ])
            ]).start();
        } else {
            // Close animation
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: -width, duration: 250, useNativeDriver: true }),
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
            // @ts-ignore
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' } as any],
            } as any);
        });
    };

    const closeMenu = (callback?: () => void) => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -width,
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
                <View style={styles.leftSection}>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        style={styles.menuButton}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                        <Icon name="menu" size={32} color="#1A1F3A" />
                    </TouchableOpacity>
                    <Text style={styles.title}>MindEase</Text>
                </View>

                <View style={styles.rightSection}>
                    {isLoggedIn && userProfile && (
                        <View style={styles.profileInfoContainer}>
                            <View style={styles.profileTextContainer}>
                                <Text style={styles.profileName} numberOfLines={1}>{userProfile.name}</Text>
                                <Text style={styles.profileRole}>{userProfile.role}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.avatarMiniButton}
                                onPress={() => handleNavigation('Profile')}
                            >
                                <View style={styles.avatarMini}>
                                    <Text style={styles.avatarMiniText}>
                                        {userProfile.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.notificationIconButton}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                        <Icon name="notifications-outline" size={26} color="#1A1F3A" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => closeMenu()}
            >
                <View style={styles.modalOverlay}>
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
                                onPress={() => handleNavigation('Home')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBox, { backgroundColor: '#E8EFFF' }]}>
                                    <Icon name="home" size={24} color="#5B7FFF" />
                                </View>
                                <Text style={styles.fullScreenMenuText}>Home</Text>
                                <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                            </AnimatedTouchableOpacity>

                            <AnimatedTouchableOpacity
                                style={[styles.fullScreenMenuItem, { opacity: item2Op, transform: [{ translateY: item2Anim }] }]}
                                onPress={() => handleNavigation('Appointment')}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconBox, { backgroundColor: '#E0F7F5' }]}>
                                    <Icon name="calendar" size={24} color="#4ECDC4" />
                                </View>
                                <Text style={styles.fullScreenMenuText}>Appointments</Text>
                                <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                            </AnimatedTouchableOpacity>

                            {!isLoggedIn ? (
                                <>
                                    <AnimatedTouchableOpacity
                                        style={[styles.fullScreenMenuItem, { opacity: item3Op, transform: [{ translateY: item3Anim }] }]}
                                        onPress={() => handleNavigation('Pharmacy')}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#F0F4FF' }]}>
                                            <Icon name="medkit" size={24} color="#5B7FFF" />
                                        </View>
                                        <Text style={styles.fullScreenMenuText}>Pharmacy</Text>
                                        <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                                    </AnimatedTouchableOpacity>

                                    <AnimatedTouchableOpacity
                                        style={[styles.fullScreenMenuItem, { opacity: item4Op, transform: [{ translateY: item4Anim }] }]}
                                        onPress={() => handleNavigation('Labs')}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                                            <Icon name="flask" size={24} color="#10B981" />
                                        </View>
                                        <Text style={styles.fullScreenMenuText}>Labs</Text>
                                        <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                                    </AnimatedTouchableOpacity>

                                    <AnimatedTouchableOpacity
                                        style={[styles.fullScreenMenuItem, { opacity: item5Op, transform: [{ translateY: item5Anim }] }]}
                                        onPress={() => handleNavigation('Login', { role: 'doctor', initialMode: 'signup' })}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                                            <Icon name="medical" size={24} color="#5B7FFF" />
                                        </View>
                                        <Text style={styles.fullScreenMenuText}>Join as Doctor</Text>
                                        <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                                    </AnimatedTouchableOpacity>

                                    <AnimatedTouchableOpacity
                                        style={[styles.fullScreenMenuItem, { opacity: item6Op, transform: [{ translateY: item6Anim }] }]}
                                        onPress={() => handleNavigation('Login', { role: 'patient', initialMode: 'signup' })}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                                            <Icon name="person-add" size={24} color="#10B981" />
                                        </View>
                                        <Text style={styles.fullScreenMenuText}>Join as Patient</Text>
                                        <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                                    </AnimatedTouchableOpacity>

                                    <AnimatedTouchableOpacity
                                        style={[styles.fullScreenMenuItem, { opacity: item6Op, transform: [{ translateY: item6Anim }] }]}
                                        onPress={() => handleNavigation('Login')}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#E0F7F5' }]}>
                                            <Icon name="log-in" size={24} color="#4ECDC4" />
                                        </View>
                                        <Text style={styles.fullScreenMenuText}>Login</Text>
                                        <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                                    </AnimatedTouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <AnimatedTouchableOpacity
                                        style={[styles.fullScreenMenuItem, { opacity: item3Op, transform: [{ translateY: item3Anim }] }]}
                                        onPress={() => handleNavigation('Pharmacy')}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#F0F4FF' }]}>
                                            <Icon name="medkit" size={24} color="#5B7FFF" />
                                        </View>
                                        <Text style={styles.fullScreenMenuText}>Pharmacy</Text>
                                        <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                                    </AnimatedTouchableOpacity>

                                    <AnimatedTouchableOpacity
                                        style={[styles.fullScreenMenuItem, { opacity: item4Op, transform: [{ translateY: item4Anim }] }]}
                                        onPress={() => handleNavigation('Labs')}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                                            <Icon name="flask" size={24} color="#10B981" />
                                        </View>
                                        <Text style={styles.fullScreenMenuText}>Labs</Text>
                                        <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                                    </AnimatedTouchableOpacity>

                                    <AnimatedTouchableOpacity
                                        style={[styles.fullScreenMenuItem, { opacity: item5Op, transform: [{ translateY: item5Anim }] }]}
                                        onPress={() => handleNavigation('Profile')}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#F3EFFF' }]}>
                                            <Icon name="person" size={24} color="#A78BFA" />
                                        </View>
                                        <Text style={styles.fullScreenMenuText}>Profile</Text>
                                        <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                                    </AnimatedTouchableOpacity>

                                    <AnimatedTouchableOpacity
                                        style={[styles.fullScreenMenuItem, { opacity: item6Op, transform: [{ translateY: item6Anim }] }]}
                                        onPress={handleLogout}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                                            <Icon name="log-out" size={24} color="#EF4444" />
                                        </View>
                                        <Text style={styles.fullScreenMenuText}>Logout</Text>
                                        <Icon name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                                    </AnimatedTouchableOpacity>
                                </>
                            )}
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>MindEase Premium Care</Text>
                        </View>
                    </Animated.View>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => closeMenu()} activeOpacity={1} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        zIndex: 100,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    contentContainer: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationIconButton: {
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginLeft: 4,
    },
    profileInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    profileTextContainer: {
        alignItems: 'flex-end',
        marginRight: 8,
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1F3A',
        maxWidth: 100,
    },
    profileRole: {
        fontSize: 10,
        color: '#5B7FFF',
        fontWeight: '600',
        marginTop: -2,
    },
    avatarMiniButton: {
        shadowColor: '#5B7FFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarMini: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#5B7FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    avatarMiniText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    notificationDot: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
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
        letterSpacing: -0.5,
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
        width: '80%',
        backgroundColor: '#FFFFFF',
        height: '100%',
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 0 },
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
        backgroundColor: '#F0F4FF',
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
        color: '#1A1F3A',
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
