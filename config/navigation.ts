import { DeepLinkConfig, TabBarConfig } from '../types/navigation';

// Deep linking configuration
export const linkingConfig: DeepLinkConfig = {
  screens: {
    index: '/',
    onboarding: '/onboarding',
    '(tabs)': {
      screens: {
        index: '/home',
        explore: '/explore',
        create: '/create',
        messages: '/messages',
        profile: '/profile',
      },
    },
    'auth/signin': '/auth/signin',
    'auth/signup': '/auth/signup',
    'auth/forgot-password': '/auth/forgot-password',
    'auth/profile-setup': '/auth/profile-setup',
    'listing/create': '/listing/create',
    'listing/[id]': '/listing/:id',
    'profile/edit': '/profile/edit',
    'settings/index': '/settings',
    'messages/[conversationId]': '/messages/:conversationId',
  },
};

// Tab bar configuration
export const getTabBarConfig = (isDark: boolean): TabBarConfig => ({
  activeTintColor: isDark ? '#87A96B' : '#2D5016', // sage-green : forest-green
  inactiveTintColor: isDark ? '#6B7280' : '#9CA3AF', // gray-500 : gray-400
  backgroundColor: isDark ? '#1F2937' : '#FFFFFF', // gray-800 : white
  borderTopColor: isDark ? '#374151' : '#E5E7EB', // gray-700 : gray-300
  height: 80,
  paddingBottom: 20,
  paddingTop: 10,
});

// Navigation animation presets
export const navigationAnimations = {
  slideFromRight: {
    animation: 'slide_from_right' as const,
    duration: 300,
    easing: 'ease-out' as const,
  },
  slideFromBottom: {
    animation: 'slide_from_bottom' as const,
    duration: 400,
    easing: 'ease-out' as const,
  },
  fade: {
    animation: 'fade' as const,
    duration: 200,
    easing: 'ease-in-out' as const,
  },
  modal: {
    animation: 'slide_from_bottom' as const,
    duration: 350,
    easing: 'ease-out' as const,
  },
};

// Screen options presets
export const screenOptions = {
  default: {
    headerShown: false,
    animation: navigationAnimations.slideFromRight,
  },
  modal: {
    headerShown: true,
    presentation: 'modal' as const,
    animation: navigationAnimations.modal,
  },
  transparentModal: {
    headerShown: false,
    presentation: 'transparentModal' as const,
    animation: navigationAnimations.fade,
  },
  fullScreenModal: {
    headerShown: false,
    presentation: 'fullScreenModal' as const,
    animation: navigationAnimations.slideFromBottom,
  },
};

// Tab configuration
export const tabConfig = {
  home: {
    name: 'index',
    title: 'Home',
    iconName: 'home',
    iconNameFocused: 'home',
  },
  explore: {
    name: 'explore',
    title: 'Explore',
    iconName: 'search',
    iconNameFocused: 'search',
  },
  create: {
    name: 'create',
    title: 'Share',
    iconName: 'plus-circle',
    iconNameFocused: 'plus-circle',
    isFloatingButton: true,
  },
  messages: {
    name: 'messages',
    title: 'Messages',
    iconName: 'message-circle',
    iconNameFocused: 'message-circle',
  },
  profile: {
    name: 'profile',
    title: 'Profile',
    iconName: 'user',
    iconNameFocused: 'user',
  },
} as const;

// Navigation state persistence key
export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

// Route access control
export const routeAccessControl = {
  public: [
    '/',
    '/onboarding',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
  ],
  authenticated: [
    '/home',
    '/explore',
    '/create',
    '/messages',
    '/profile',
    '/listing/create',
    '/profile/edit',
    '/settings',
  ],
  onboardingRequired: [
    '/auth/profile-setup',
  ],
} as const;