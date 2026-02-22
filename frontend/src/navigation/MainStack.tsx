import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../pages/HomeScreen';
import DoctorDashboardScreen from '../pages/DoctorDashboardScreen';
import ProfileScreen from '../pages/ProfileScreen';
import AllSpecialistsScreen from '../pages/AllSpecialistsScreen';
import SelectLocationScreen from '../pages/SelectLocationScreen';
import PaymentScreen from '../pages/PaymentScreen';
import PharmacyScreen from '../pages/PharmacyScreen';
import LabsScreen from '../pages/LabsScreen';
import DoctorProfileSetupScreen from '../pages/DoctorProfileSetupScreen';
import PendingVerificationScreen from '../pages/PendingVerificationScreen';
import LoginScreen from '../pages/LoginScreen';
import OtpVerificationScreen from '../pages/OtpVerificationScreen';
import type { MainStackParamList } from './types';
import { useAuthState } from './authState';

const Stack = createNativeStackNavigator<MainStackParamList>();

const HomeEntryScreen = () => {
  const { isAuthenticated } = useAuthState();
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadRole = async () => {
      if (!isAuthenticated) {
        setRole(null);
        return;
      }

      const storedRole = await AsyncStorage.getItem('role');
      setRole(storedRole?.toLowerCase() ?? null);
    };

    loadRole();
  }, [isAuthenticated]);

  return role === 'doctor' ? <DoctorDashboardScreen /> : <HomeScreen />;
};

const MainStack = () => {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      {/* Add post-login app screens here (core pages + detail flows). */}
      <Stack.Screen name="Home" component={HomeEntryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AllSpecialists" component={AllSpecialistsScreen} />
      <Stack.Screen name="SelectLocation" component={SelectLocationScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Pharmacy" component={PharmacyScreen} />
      <Stack.Screen name="Labs" component={LabsScreen} />
      <Stack.Screen name="DoctorProfileSetup" component={DoctorProfileSetupScreen} />
      <Stack.Screen name="PendingVerification" component={PendingVerificationScreen} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;
