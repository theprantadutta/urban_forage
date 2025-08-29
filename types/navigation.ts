import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Root Stack Navigator Types
export type RootStackParamList = {
  index: undefined;
  onboarding: undefined;
  '(tabs)': NavigatorScreenParams<TabParamList>;
  'auth/signin': undefined;
  'auth/signup': undefined;
  'auth/forgot-password': undefined;
  'auth/profile-setup': undefined;
  '+not-found': undefined;
  // Modal screens
  'listing/create': undefined;
  'listing/[id]': { id: string };
  'profile/edit': undefined;
  'settings/index': undefined;
  'messages/[conversationId]': { conversationId: string };
};

// Tab Navigator Types
export type TabParamList = {
  index: undefined;
  explore: undefined;
  create: undefined;
  messages: undefined;
  profile: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

// Navigation State Types
export interface NavigationState {
  currentRoute: string;
  previousRoute?: string;
  tabHistory: string[];
  canGoBack: boolean;
}

// Deep Link Types
export interface DeepLinkConfig {
  screens: {
    index: string;
    onboarding: string;
    '(tabs)': {
      screens: {
        index: string;
        explore: string;
        create: string;
        messages: string;
        profile: string;
      };
    };
    'auth/signin': string;
    'auth/signup': string;
    'auth/forgot-password': string;
    'auth/profile-setup': string;
    'listing/create': string;
    'listing/[id]': string;
    'profile/edit': string;
    'settings/index': string;
    'messages/[conversationId]': string;
  };
}

// Tab Bar Configuration
export interface TabBarConfig {
  activeTintColor: string;
  inactiveTintColor: string;
  backgroundColor: string;
  borderTopColor: string;
  height: number;
  paddingBottom: number;
  paddingTop: number;
}

// Navigation Animation Types
export type NavigationAnimation = 
  | 'slide_from_right'
  | 'slide_from_left'
  | 'slide_from_bottom'
  | 'fade'
  | 'flip'
  | 'none';

export interface NavigationTransition {
  animation: NavigationAnimation;
  duration: number;
  easing?: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

// Route Configuration
export interface RouteConfig {
  name: string;
  component: React.ComponentType<any>;
  options?: {
    title?: string;
    headerShown?: boolean;
    tabBarIcon?: (props: { color: string; size: number; focused: boolean }) => React.ReactNode;
    tabBarLabel?: string;
    tabBarBadge?: string | number;
    presentation?: 'modal' | 'transparentModal' | 'fullScreenModal';
    animation?: NavigationTransition;
  };
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}