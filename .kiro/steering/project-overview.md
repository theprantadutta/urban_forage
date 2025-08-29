# UrbanForage Project Overview

## Vision Statement
Create the most visually stunning and user-friendly food sharing platform that transforms how communities connect around local, sustainable food sources. The app will feature cinema-quality animations, immersive gradients, and micro-interactions that make discovering local food feel magical.

## Core Value Propositions
- **For Producers:** Easy way to share excess harvest with beautiful listing creation
- **For Consumers:** Discover local, fresh food with an Instagram-level visual experience  
- **For Community:** Build sustainable food networks through gamified social features

## Technical Stack
- **Frontend Framework:** Expo SDK 51+ with TypeScript
- **Styling Solution:** NativeWind (Tailwind CSS for React Native) + Custom Components
- **State Management:** Zustand with React Query
- **Database:** Firebase Firestore with Realtime Database
- **Authentication:** Firebase Auth with social providers
- **Storage:** Firebase Storage with Cloudinary integration
- **Maps:** React Native Maps with custom clustering
- **Camera:** Expo Camera with TensorFlow.js Lite
- **Notifications:** Expo Notifications with FCM

## Design Philosophy
1. **Organic Elegance** - Natural curves, botanical-inspired elements, earth-tones
2. **Premium Feel** - Glass-morphism effects, subtle shadows, high-quality imagery
3. **Intuitive Flow** - Zero cognitive load navigation with predictive animations
4. **Seasonal Adaptation** - UI colors and themes that change with seasons
5. **Accessibility First** - Beautiful AND inclusive design

## Color System
```
Primary Palette:
- Forest Green: #2D5016 (trust, growth)
- Sage Green: #87A96B (calm, natural)  
- Warm Orange: #D2691E (energy, harvest)
- Golden Yellow: #DAA520 (sun, abundance)

Secondary Palette:
- Cream White: #FDF6E3 (cleanliness, space)
- Earth Brown: #8B4513 (grounding, soil)
- Sky Blue: #87CEEB (freshness, water)
```

## Animation Philosophy
Every interaction should feel intentional, responsive, and delightful while maintaining performance. Use `useNativeDriver` for all animations and implement lazy loading for heavy components.

## Performance Benchmarks
- **App Launch Time:** < 3 seconds to interactive
- **Screen Transitions:** 60fps with < 16ms frame time
- **Image Loading:** Progressive loading with placeholders
- **Offline Capability:** Core features available without network