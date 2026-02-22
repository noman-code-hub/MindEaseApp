import type { NavigatorScreenParams } from '@react-navigation/native';

export type UserRole = 'doctor' | 'patient' | string;

export type SelectLocationResult = {
  latitude: number;
  longitude: number;
};

export type LoginParams = {
  role?: UserRole;
  initialMode?: 'login' | 'signup';
};

export type DoctorProfileSetupParams = {
  userId?: string | null;
  token?: string | null;
  selectedLocation?: SelectLocationResult;
};

export type AuthStackParamList = {
  Login: LoginParams | undefined;
  OtpVerification: {
    userId: string;
    phoneNumber: string;
    receivedOtp?: string;
    role?: UserRole;
  };
  PendingVerification: undefined;
  DoctorProfileSetup: DoctorProfileSetupParams | undefined;
  SelectLocation: {
    onSelect?: (location: SelectLocationResult) => void;
  } | undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Login: LoginParams | undefined;
  OtpVerification: AuthStackParamList['OtpVerification'];
  Profile: undefined;
  AllSpecialists:
    | {
        initialQuery?: string;
        specialityId?: string;
      }
    | undefined;
  SelectLocation:
    | {
        onSelect?: (location: SelectLocationResult) => void;
      }
    | undefined;
  Payment:
    | {
        bookingPayload?: unknown;
        token?: string;
        userId?: string;
        amount?: number | string;
      }
    | undefined;
  Pharmacy: undefined;
  Labs: undefined;
  DoctorProfileSetup: DoctorProfileSetupParams | undefined;
  PendingVerification: undefined;
};

export type TabNavigatorParamList = {
  MainStack: NavigatorScreenParams<MainStackParamList>;
  Appointment: undefined;
  Billing: undefined;
  Records: undefined;
};

export type DrawerParamList = {
  MainTabs: NavigatorScreenParams<TabNavigatorParamList>;
};

export type RootStackParamList = {
  Guest: NavigatorScreenParams<MainStackParamList> | undefined;
  App: NavigatorScreenParams<DrawerParamList> | undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
