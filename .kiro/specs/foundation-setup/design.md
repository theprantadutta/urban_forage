# Design Document - Foundation Setup

## Overview

The Foundation Setup establishes the core infrastructure for UrbanForage, focusing on creating a premium visual experience with exceptional performance. This phase implements the design system, authentication flows, and navigation structure that will support all future features.

## Architecture

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Basic components (Button, Card, Input, etc.)
│   ├── forms/           # Form-specific components
│   ├── animations/      # Custom animated components
│   └── ui/              # Complex UI patterns
├── screens/             # Screen components
│   ├── auth/           # Authentication flows
│   ├── onboarding/     # User onboarding
│   └── main/           # Main app screens
├── hooks/              # Custom React hooks
├── services/           # API and external service integrations
├── utils/              # Helper functions and constants
├── types/              # TypeScript type definitions
├── stores/             # Zustand stores
├── assets/             # Images, fonts, animations
└── config/             # Environment and app configuration
```

### Technology Stack Integration
- **NativeWind**: Primary styling solution with custom Tailwind configuration
- **React Native Reanimated 3**: High-performance animations
- **Expo Router**: File-based routing with deep linking support
- **Firebase Auth**: Authentication with social providers
- **Zustand**: Lightweight state management
- **React Query**: Server state management and caching

## Components and Interfaces

### Design System Components

#### Button Component
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  onPress,
  disabled = false,
  loading = false,
  hapticType = 'medium'
}) => {
  // Implementation with NativeWind classes and animations
};
```

#### Card Component
```tsx
interface CardProps {
  children: React.ReactNode;
  variant: 'default' | 'glassmorphism' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  onPress
}) => {
  // Implementation with proper shadows and animations
};
```

#### Input Component
```tsx
interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'phone';
  icon?: React.ReactNode;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  type = 'text',
  icon,
  disabled = false
}) => {
  // Implementation with validation states and animations
};
```

### Authentication Components

#### OnboardingScreen
```tsx
interface OnboardingScreenProps {
  title: string;
  subtitle: string;
  illustration: React.ReactNode;
  onNext: () => void;
  onSkip?: () => void;
  isLastScreen?: boolean;
}
```

#### AuthForm
```tsx
interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSubmit: (credentials: AuthCredentials) => void;
  onSocialAuth: (provider: SocialProvider) => void;
  loading?: boolean;
  error?: string;
}
```

### Navigation Components

#### CustomTabBar
```tsx
interface TabBarProps {
  state: NavigationState;
  descriptors: Record<string, Descriptor>;
  navigation: NavigationHelpers;
}
```

#### FloatingActionButton
```tsx
interface FABProps {
  onPress: () => void;
  icon: React.ReactNode;
  expanded?: boolean;
  actions?: FABAction[];
}
```

## Data Models

### User Model
```tsx
interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    units: 'metric' | 'imperial';
  };
  profile: {
    bio?: string;
    interests: string[];
    joinedAt: Date;
    verified: boolean;
  };
  stats: {
    listingsCreated: number;
    itemsShared: number;
    communityRating: number;
  };
}
```

### Authentication State
```tsx
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onboardingCompleted: boolean;
}
```

### Theme Configuration
```tsx
interface ThemeConfig {
  colors: {
    primary: ColorPalette;
    secondary: ColorPalette;
    seasonal: SeasonalColors;
    neutral: ColorPalette;
  };
  typography: {
    fontFamily: FontFamily;
    sizes: FontSizes;
    weights: FontWeights;
  };
  spacing: SpacingScale;
  borderRadius: BorderRadiusScale;
  shadows: ShadowPresets;
}
```

## Error Handling

### Authentication Errors
- **Network Errors**: Display retry mechanism with offline indicator
- **Validation Errors**: Show inline validation with helpful messages
- **Social Auth Errors**: Provide fallback to email authentication
- **Session Expiry**: Automatic token refresh with seamless re-authentication

### Component Error Boundaries
```tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ComponentErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  // Error boundary implementation with recovery UI
}
```

### Form Validation
```tsx
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface FormValidation {
  [fieldName: string]: ValidationRule[];
}
```

## Testing Strategy

### Unit Testing
- **Component Testing**: Test all reusable components with React Native Testing Library
- **Hook Testing**: Test custom hooks with proper mocking
- **Utility Testing**: Test helper functions and validation logic
- **Store Testing**: Test Zustand stores with proper state management

### Integration Testing
- **Authentication Flow**: Test complete sign-up and sign-in processes
- **Navigation**: Test screen transitions and deep linking
- **Form Handling**: Test form validation and submission
- **Error Scenarios**: Test error handling and recovery

### Visual Testing
- **Storybook Integration**: Document components with interactive examples
- **Screenshot Testing**: Automated visual regression testing
- **Accessibility Testing**: Test with screen readers and accessibility tools
- **Performance Testing**: Monitor render times and animation performance

### Testing Configuration
```tsx
// Jest configuration for React Native
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## Performance Considerations

### Animation Optimization
- Use `useNativeDriver: true` for all animations
- Implement `InteractionManager.runAfterInteractions()` for heavy operations
- Use `LayoutAnimation` for simple layout changes
- Optimize re-renders with `React.memo` and `useMemo`

### Bundle Size Optimization
- Implement code splitting with dynamic imports
- Use tree shaking for unused dependencies
- Optimize image assets with proper compression
- Implement lazy loading for non-critical components

### Memory Management
- Clean up event listeners and subscriptions
- Use weak references where appropriate
- Implement proper cleanup in useEffect hooks
- Monitor memory usage with development tools

## Security Considerations

### Authentication Security
- Implement proper token storage with Keychain/Keystore
- Use secure communication with HTTPS only
- Implement proper session management
- Add biometric authentication where available

### Data Protection
- Validate all user inputs
- Sanitize data before storage
- Implement proper error handling without exposing sensitive information
- Use proper encryption for sensitive data

### Privacy Compliance
- Implement proper permission requests
- Provide clear privacy policy integration
- Allow users to control data sharing
- Implement data deletion capabilities