import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TabNavigatorParamList } from '../navigation/types';

type TopBarNavigationProp = BottomTabNavigationProp<TabNavigatorParamList>;

type TopBarProps = {
  navigation: TopBarNavigationProp;
};

const TopBar = ({ navigation }: TopBarProps) => {
  const insets = useSafeAreaInsets();
  const [profileName, setProfileName] = React.useState<string>('User');
  const [profileRole, setProfileRole] = React.useState<string>('Patient');

  React.useEffect(() => {
    const loadUserMeta = async () => {
      const role = await AsyncStorage.getItem('role');
      const name = await AsyncStorage.getItem('doctorName');
      setProfileRole(role?.toLowerCase() === 'doctor' ? 'Doctor' : 'Patient');
      setProfileName(name || 'User');
    };

    loadUserMeta();
  }, []);

  const openDrawer = () => {
    let currentNavigation: any = navigation;

    while (currentNavigation) {
      if (typeof currentNavigation.openDrawer === 'function') {
        currentNavigation.openDrawer();
        return;
      }

      currentNavigation = currentNavigation.getParent?.();
    }
  };

  const openProfile = () => {
    navigation.navigate('MainStack', { screen: 'Profile' });
  };

  const openNotifications = () => {
    navigation.navigate('Appointment');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.content}>
        <View style={styles.left}>
          <TouchableOpacity onPress={openDrawer} style={styles.iconButton}>
            <Icon name="menu" size={26} color="#1A1F3A" />
          </TouchableOpacity>
          <Text style={styles.title}>MindEase</Text>
        </View>

        <View style={styles.right}>
          <TouchableOpacity style={styles.profile} onPress={openProfile}>
            <View style={styles.profileText}>
              <Text style={styles.name} numberOfLines={1}>
                {profileName}
              </Text>
              <Text style={styles.role}>{profileRole}</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profileName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={openNotifications}>
            <Icon name="notifications-outline" size={22} color="#1A1F3A" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={openDrawer}>
            <Icon name="menu" size={22} color="#1A1F3A" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  content: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#1A1F3A',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileText: {
    alignItems: 'flex-end',
    maxWidth: 110,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1F3A',
  },
  role: {
    fontSize: 10,
    color: '#5B7FFF',
    fontWeight: '600',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5B7FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default TopBar;

