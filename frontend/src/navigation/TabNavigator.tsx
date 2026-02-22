import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MainStack from './MainStack';
import TopBar from '../components/TopBar';
import AppointmentScreen from '../pages/AppointmentScreen';
import BillingScreen from '../pages/BillingScreen';
import RecordsScreen from '../pages/RecordsScreen';
import type { DrawerParamList, TabNavigatorParamList } from './types';

const Tab = createBottomTabNavigator<TabNavigatorParamList>();
type DrawerNavProp = DrawerNavigationProp<DrawerParamList>;
const FULLSCREEN_TAB_SCREENS = new Set(['Login']);

const isMainStackFullscreenRoute = (route: any): boolean => {
  const nestedRouteName =
    getFocusedRouteNameFromRoute(route) ?? route?.params?.screen ?? 'Home';
  return FULLSCREEN_TAB_SCREENS.has(nestedRouteName);
};

const TabNavigator = () => {
  const [role, setRole] = React.useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const baseTabBarStyle = React.useMemo(
    () => ({
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
      elevation: 5,
      height: 60 + insets.bottom,
      paddingBottom: Math.max(insets.bottom, 8),
      paddingTop: 8,
      backgroundColor: '#FFFFFF',
    }),
    [insets.bottom],
  );

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
        header: ({ navigation }) => (
          <TopBar navigation={navigation.getParent() as DrawerNavProp} />
        ),
        headerShown:
          route.name === 'MainStack' ? !isMainStackFullscreenRoute(route) : true,
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
        tabBarStyle:
          route.name === 'MainStack' && isMainStackFullscreenRoute(route)
            ? { ...baseTabBarStyle, display: 'none' }
            : baseTabBarStyle,
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
