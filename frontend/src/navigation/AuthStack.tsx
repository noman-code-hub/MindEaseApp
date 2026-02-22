import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../pages/LoginScreen';
import OtpVerificationScreen from '../pages/OtpVerificationScreen';
import PendingVerificationScreen from '../pages/PendingVerificationScreen';
import DoctorProfileSetupScreen from '../pages/DoctorProfileSetupScreen';
import SelectLocationScreen from '../pages/SelectLocationScreen';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      {/* Add auth-only screens here (login, verification, onboarding). */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="PendingVerification" component={PendingVerificationScreen} />
      <Stack.Screen name="DoctorProfileSetup" component={DoctorProfileSetupScreen} />
      <Stack.Screen name="SelectLocation" component={SelectLocationScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
