# NativeWind Configuration and Usage

## Setup Instructions

### Installation
```bash
npm install nativewind
npm install --save-dev tailwindcss
```

### Tailwind Configuration
Create `tailwind.config.js` with UrbanForage custom theme:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary Palette
        'forest-green': '#2D5016',
        'sage-green': '#87A96B',
        'warm-orange': '#D2691E',
        'golden-yellow': '#DAA520',
        
        // Secondary Palette
        'cream-white': '#FDF6E3',
        'earth-brown': '#8B4513',
        'sky-blue': '#87CEEB',
        
        // Seasonal Overlays
        spring: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        summer: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        fall: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
        winter: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
        }
      },
      fontFamily: {
        'sf-pro': ['SF Pro Display', 'system-ui'],
        'sf-text': ['SF Pro Text', 'system-ui'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
```

### Metro Configuration
Update `metro.config.js`:

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

### Global CSS
Create `global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Usage Patterns

### Basic Component Styling
```tsx
import { View, Text, TouchableOpacity } from 'react-native';

export const FoodCard = ({ title, distance, image }) => {
  return (
    <View className="bg-white rounded-2xl shadow-lg p-4 m-2">
      <Image 
        source={{ uri: image }} 
        className="w-full h-48 rounded-xl mb-3"
      />
      <Text className="text-forest-green text-lg font-bold mb-1">
        {title}
      </Text>
      <Text className="text-sage-green text-sm">
        {distance} away
      </Text>
      <TouchableOpacity className="bg-warm-orange px-4 py-2 rounded-full mt-3 active:scale-95">
        <Text className="text-white font-semibold text-center">
          View Details
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Responsive Design
```tsx
// Use responsive classes for different screen sizes
<View className="px-4 sm:px-6 lg:px-8">
  <Text className="text-lg sm:text-xl lg:text-2xl font-bold">
    Discover Local Food
  </Text>
</View>
```

### Dark Mode Support
```tsx
<View className="bg-cream-white dark:bg-gray-900">
  <Text className="text-forest-green dark:text-sage-green">
    Welcome to UrbanForage
  </Text>
</View>
```

### Animation Classes
```tsx
// Use custom animation classes
<View className="animate-fade-in">
  <TouchableOpacity className="transform transition-transform active:scale-95 hover:scale-105">
    <Text>Animated Button</Text>
  </TouchableOpacity>
</View>
```

### Seasonal Theming
```tsx
// Use seasonal color variants
const SeasonalButton = ({ season = 'spring' }) => {
  const seasonalClasses = {
    spring: 'bg-spring-500 hover:bg-spring-600',
    summer: 'bg-summer-500 hover:bg-summer-600',
    fall: 'bg-fall-500 hover:bg-fall-600',
    winter: 'bg-winter-500 hover:bg-winter-600',
  };

  return (
    <TouchableOpacity className={`px-6 py-3 rounded-full ${seasonalClasses[season]}`}>
      <Text className="text-white font-semibold">Seasonal Action</Text>
    </TouchableOpacity>
  );
};
```

## Best Practices

### Performance Optimization
- Use `className` prop instead of inline styles
- Leverage Tailwind's utility classes for consistency
- Use responsive design classes appropriately
- Minimize custom CSS when possible

### Accessibility
```tsx
// Include accessibility classes
<TouchableOpacity 
  className="bg-sage-green px-4 py-3 rounded-lg focus:ring-2 focus:ring-forest-green"
  accessibilityRole="button"
  accessibilityLabel="Add to favorites"
>
  <Text className="text-white font-medium">Add to Favorites</Text>
</TouchableOpacity>
```

### Component Composition
```tsx
// Create reusable component variants
const Button = ({ variant = 'primary', size = 'medium', children, ...props }) => {
  const baseClasses = 'rounded-full font-semibold text-center active:scale-95';
  
  const variantClasses = {
    primary: 'bg-forest-green text-white',
    secondary: 'bg-sage-green text-white',
    outline: 'border-2 border-forest-green text-forest-green bg-transparent',
  };
  
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg',
  };
  
  return (
    <TouchableOpacity 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      <Text className={variantClasses[variant].includes('text-white') ? 'text-white' : 'text-forest-green'}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};
```

## Common Patterns

### Card Components
```tsx
const GlassmorphismCard = ({ children }) => (
  <View className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4">
    {children}
  </View>
);
```

### Gradient Backgrounds
```tsx
// Use with react-native-linear-gradient
import LinearGradient from 'react-native-linear-gradient';

const GradientBackground = ({ children }) => (
  <LinearGradient
    colors={['#2D5016', '#87A96B']}
    className="flex-1"
  >
    {children}
  </LinearGradient>
);
```

### Loading States
```tsx
const SkeletonLoader = () => (
  <View className="animate-pulse">
    <View className="bg-gray-300 h-48 rounded-xl mb-3" />
    <View className="bg-gray-300 h-4 rounded mb-2" />
    <View className="bg-gray-300 h-4 rounded w-3/4" />
  </View>
);
```