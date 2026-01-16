import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import PlansScreen from '../screens/PlansScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: [
                    styles.tabBar,
                    { height: 55 + insets.bottom, paddingBottom: insets.bottom },
                ],
                tabBarActiveTintColor: '#5B7FFF',
                tabBarInactiveTintColor: '#999',
                tabBarShowLabel: true,
                tabBarLabelStyle: styles.tabBarLabel,
            }}>
            <Tab.Screen
                name="HOME"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => <Icon name="home" size={22} color={color} />,
                }}
            />
            <Tab.Screen
                name="PLANS"
                component={PlansScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Icon name="calendar" size={22} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Add"
                component={HomeScreen}
                options={{
                    tabBarButton: ({ onPress, onLongPress, accessibilityState, accessibilityLabel }) => (
                        <TouchableOpacity
                            onPress={onPress}
                            onLongPress={onLongPress || undefined}
                            accessibilityState={accessibilityState}
                            accessibilityLabel={accessibilityLabel}
                            style={styles.addButtonContainer}
                            activeOpacity={0.8}>
                            <View style={styles.addButtonInner}>
                                <Icon name="add" size={28} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                    ),
                    tabBarLabel: () => null,
                }}
            />
            <Tab.Screen
                name="CHAT"
                component={ChatScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Icon name="chatbubbles" size={22} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="PROFILE"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Icon name="person" size={22} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 0,
        elevation: 0,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    tabBarLabel: {
        fontSize: 9,
        fontWeight: '600',
        marginBottom: 4,
    },
    addButtonContainer: {
        top: -25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1A1F3A',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
});

export default BottomTabNavigator;
