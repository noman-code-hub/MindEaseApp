import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { DrawerParamList } from '../navigation/types';
import { createResponsiveStyles } from '../utils/responsive';

type TopBarNavigationProp = DrawerNavigationProp<DrawerParamList>;

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
    navigation.openDrawer();
  };

  const openProfile = () => {
    navigation.navigate('MainTabs', {
      screen: 'MainStack',
      params: { screen: 'Profile' },
    });
  };

  const openNotifications = () => {
    navigation.navigate('MainTabs', { screen: 'Appointment' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.content}>
        <View style={styles.left}>
          <TouchableOpacity onPress={openDrawer} style={[styles.iconButton, styles.menuButton]}>
            <Icon name="menu" size={22} color="#1A1F3A" />
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
        </View>
      </View>
    </View>
  );
};

const styles = createResponsiveStyles({
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
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
