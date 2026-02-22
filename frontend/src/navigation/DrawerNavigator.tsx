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
  onPress,
}: {
  label: string;
  icon: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.drawerItem} onPress={onPress}>
    <Icon name={icon} size={20} color="#1A1F3A" />
    <Text style={styles.drawerLabel}>{label}</Text>
  </TouchableOpacity>
);

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { signOut } = useAuthState();
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadRole = async () => {
      const storedRole = await AsyncStorage.getItem('role');
      setRole(storedRole?.toLowerCase() ?? null);
    };

    loadRole();
  }, []);

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

  const handleLogout = async () => {
    props.navigation.closeDrawer();
    await signOut();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.contentContainer}>
        <View>
          <Text style={styles.title}>MindEase</Text>
          <Text style={styles.subtitle}>Navigation</Text>
        </View>

        <View style={styles.section}>
          <DrawerItem label="Home" icon="home-outline" onPress={() => navigateToMainStackScreen('Home')} />
          <DrawerItem
            label="Appointments"
            icon="calendar-outline"
            onPress={() => navigateToTab('Appointment')}
          />
          {role === 'doctor' ? (
            <DrawerItem label="Billing" icon="receipt-outline" onPress={() => navigateToTab('Billing')} />
          ) : (
            <DrawerItem label="Records" icon="file-tray-full-outline" onPress={() => navigateToTab('Records')} />
          )}
          <DrawerItem
            label="Profile"
            icon="person-outline"
            onPress={() => navigateToMainStackScreen('Profile')}
          />
          <DrawerItem
            label="Pharmacy"
            icon="medkit-outline"
            onPress={() => navigateToMainStackScreen('Pharmacy')}
          />
          <DrawerItem label="Labs" icon="flask-outline" onPress={() => navigateToMainStackScreen('Labs')} />
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <DrawerItem label="Logout" icon="log-out-outline" onPress={handleLogout} />
      </View>
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
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {/* Keep authenticated app routes behind drawer access. */}
      <Drawer.Screen name="MainTabs" component={TabNavigator} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1F3A',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    marginTop: 20,
    gap: 6,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 10,
  },
  drawerLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1F3A',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 16,
  },
});

export default DrawerNavigator;
