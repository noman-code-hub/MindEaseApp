import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';

import TabNavigator from './TabNavigator';
import type { DrawerParamList, MainStackParamList } from './types';
import { useAuthState } from './authState';

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerItem = ({
  label,
  icon,
  iconColor,
  iconBackground,
  onPress,
}: {
  label: string;
  icon: string;
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.drawerItemTouch} onPress={onPress}>
    <View style={[styles.iconBox, { backgroundColor: iconBackground }]}>
      <Icon name={icon} size={22} color={iconColor} />
    </View>
    <Text style={styles.drawerItemText}>{label}</Text>
  </TouchableOpacity>
);

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { isAuthenticated, signOut } = useAuthState();
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

  const navigateToMainStackScreen = (screen: keyof MainStackParamList) => {
    props.navigation.navigate('MainTabs', {
      screen: 'MainStack',
      params: { screen },
    });
    props.navigation.closeDrawer();
  };

  const navigateToTab = (screen: 'Appointment' | 'Billing' | 'Records') => {
    props.navigation.navigate('MainTabs', { screen });
    props.navigation.closeDrawer();
  };

  const navigateToLogin = (roleName: 'doctor' | 'patient') => {
    props.navigation.navigate('MainTabs', {
      screen: 'MainStack',
      params: {
        screen: 'Login',
        params: { role: roleName, initialMode: 'login' },
      },
    });
    props.navigation.closeDrawer();
  };

  const handleLogout = async () => {
    props.navigation.closeDrawer();
    await signOut();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.contentContainer}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Menu</Text>
          <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
            <Icon name="close" size={24} color="#1A1F3A" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuItemsContainer}>
          <DrawerItem
            label="Home"
            icon="home"
            iconColor="#5B7FFF"
            iconBackground="#E8EFFF"
            onPress={() => navigateToMainStackScreen('Home')}
          />
          <DrawerItem
            label="Appointments"
            icon="calendar"
            iconColor="#4ECDC4"
            iconBackground="#E0F7F5"
            onPress={() => navigateToTab('Appointment')}
          />
          {role === 'doctor' ? (
            <DrawerItem
              label="Billing"
              icon="receipt"
              iconColor="#F59E0B"
              iconBackground="#FFF4E0"
              onPress={() => navigateToTab('Billing')}
            />
          ) : (
            <DrawerItem
              label="Records"
              icon="file-tray-full"
              iconColor="#5B7FFF"
              iconBackground="#EEF2FF"
              onPress={() => navigateToTab('Records')}
            />
          )}
          {isAuthenticated ? (
            <DrawerItem
              label="Profile"
              icon="person"
              iconColor="#5B7FFF"
              iconBackground="#E8EFFF"
              onPress={() => navigateToMainStackScreen('Profile')}
            />
          ) : null}
          <DrawerItem
            label="Pharmacy"
            icon="medkit"
            iconColor="#5B7FFF"
            iconBackground="#F0F4FF"
            onPress={() => navigateToMainStackScreen('Pharmacy')}
          />
          <DrawerItem
            label="Labs"
            icon="flask"
            iconColor="#10B981"
            iconBackground="#ECFDF5"
            onPress={() => navigateToMainStackScreen('Labs')}
          />
          {!isAuthenticated ? (
            <>
              <DrawerItem
                label="Doctor Login"
                icon="medical"
                iconColor="#5B7FFF"
                iconBackground="#EEF2FF"
                onPress={() => navigateToLogin('doctor')}
              />
              <DrawerItem
                label="Patient Login"
                icon="person"
                iconColor="#10B981"
                iconBackground="#F0FDF4"
                onPress={() => navigateToLogin('patient')}
              />
            </>
          ) : null}
        </View>
      </DrawerContentScrollView>

      {isAuthenticated ? (
        <View style={styles.footer}>
          <DrawerItem
            label="Logout"
            icon="log-out"
            iconColor="#EF4444"
            iconBackground="#FEF2F2"
            onPress={handleLogout}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        swipeEdgeWidth: 50,
        overlayColor: 'rgba(0,0,0,0.5)',
        drawerStyle: styles.drawerPanel,
      }}
      drawerContent={CustomDrawerContent}
    >
      {/* Keep tab routes inside a drawer so the menu works in guest and authenticated flows. */}
      <Drawer.Screen name="MainTabs" component={TabNavigator} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawerPanel: {
    width: '75%',
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1F3A',
  },
  menuItemsContainer: {
    gap: 12,
  },
  drawerItemTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1F3A',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 20,
  },
});

export default DrawerNavigator;
