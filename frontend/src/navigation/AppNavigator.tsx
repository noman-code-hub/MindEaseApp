import React from 'react';

import DrawerNavigator from './DrawerNavigator';
import { AuthStateProvider } from './authState';

const NavigationFlow = () => {
  return <DrawerNavigator />;
};

const AppNavigator = () => {
  return (
    <AuthStateProvider>
      <NavigationFlow />
    </AuthStateProvider>
  );
};

export default AppNavigator;
