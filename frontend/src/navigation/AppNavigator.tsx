import React from 'react';

import DrawerNavigator from './DrawerNavigator';
import TabNavigator from './TabNavigator';
import { AuthStateProvider, useAuthState } from './authState';

const NavigationFlow = () => {
  const { isAuthenticated } = useAuthState();
  return isAuthenticated ? <DrawerNavigator /> : <TabNavigator />;
};

const AppNavigator = () => {
  return (
    <AuthStateProvider>
      <NavigationFlow />
    </AuthStateProvider>
  );
};

export default AppNavigator;
