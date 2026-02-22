import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import MainStack from './MainStack';
import TopBar from '../components/TopBar';
import AppointmentScreen from '../pages/AppointmentScreen';
import BillingScreen from '../pages/BillingScreen';
import RecordsScreen from '../pages/RecordsScreen';
import type { TabNavigatorParamList } from './types';

const Tab = createBottomTabNavigator<TabNavigatorParamList>();

const TabNavigator = () => {
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadRole = async () => {
      const storedRole = await AsyncStorage.getItem('role');
      setRole(storedRole?.toLowerCase() ?? null);
    };

    loadRole();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <TopBar />,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'MainStack') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Appointment') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Billing') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else {
            iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
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
      {/* Add tab-level routes here. Use MainStack for multi-screen tab flows. */}
      <Tab.Screen
        name="MainStack"
        component={MainStack}
        options={{ title: 'Home', tabBarLabel: 'Home' }}
      />
      <Tab.Screen name="Appointment" component={AppointmentScreen} />
      {role === 'doctor' ? (
        <Tab.Screen name="Billing" component={BillingScreen} />
      ) : (
        <Tab.Screen name="Records" component={RecordsScreen} />
      )}
    </Tab.Navigator>
  );
};

export default TabNavigator;
