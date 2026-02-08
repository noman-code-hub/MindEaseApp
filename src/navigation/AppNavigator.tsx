import React from 'react';
import { View, ActivityIndicator, Modal } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from '../screens/HomeScreen';
import AppointmentScreen from '../screens/AppointmentScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DoctorProfileSetupScreen from '../screens/DoctorProfileSetupScreen';
import SelectLocationScreen from '../screens/SelectLocationScreen';
import BillingScreen from '../screens/BillingScreen';
import PendingVerificationScreen from '../screens/PendingVerificationScreen';
import AllSpecialistsScreen from '../screens/AllSpecialistsScreen';
import TopBar from '../components/TopBar';
import PaymentScreen from '../screens/PaymentScreen';
import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import DoctorDashboardScreen from '../screens/DoctorDashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
    const [role, setRole] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loadRole = async () => {
            const storedRole = await AsyncStorage.getItem('role');
            setRole(storedRole);
        };
        loadRole();
    }, []);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                header: () => <TopBar />,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Appointment') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Billing') {
                        iconName = focused ? 'receipt' : 'receipt-outline';
                    }
                    return <Icon name={iconName as string} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#5B7FFF',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#F0F0F0',
                    elevation: 5,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={role?.toLowerCase() === 'doctor' ? DoctorDashboardScreen : HomeScreen}
                options={{ headerShown: role?.toLowerCase() === 'doctor' }}
            />
            <Tab.Screen name="Appointment" component={AppointmentScreen} />
            {role?.toLowerCase() === 'doctor' ? (
                <Tab.Screen name="Billing" component={BillingScreen} />
            ) : (
                <Tab.Screen name="Profile" component={ProfileScreen} />
            )}
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <View style={{ flex: 1 }}>
            <Stack.Navigator
                initialRouteName={'AuthLoading'}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
                <Stack.Screen name="DoctorProfileSetup" component={DoctorProfileSetupScreen} />
                <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen name="AllSpecialists" component={AllSpecialistsScreen} />
                <Stack.Screen name="SelectLocation" component={SelectLocationScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="PendingVerification" component={PendingVerificationScreen} />
                <Stack.Screen
                    name="Payment"
                    component={PaymentScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </View>
    );
};

export default AppNavigator;
