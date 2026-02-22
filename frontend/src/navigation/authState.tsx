import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthStateContextValue = {
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
};

const AuthStateContext = React.createContext<AuthStateContextValue | undefined>(undefined);

export const AuthStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const bootstrapAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setIsAuthenticated(Boolean(token));
      } catch {
        setIsAuthenticated(false);
      }
    };

    bootstrapAuthState();
  }, []);

  const signIn = React.useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const signOut = React.useCallback(async () => {
    await AsyncStorage.multiRemove(['token', 'userId', 'role', 'doctorId', 'whatsappnumber']);
    setIsAuthenticated(false);
  }, []);

  const value = React.useMemo(
    () => ({
      isAuthenticated,
      signIn,
      signOut,
    }),
    [isAuthenticated, signIn, signOut],
  );

  return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>;
};

export const useAuthState = () => {
  const context = React.useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within AuthStateProvider');
  }

  return context;
};
