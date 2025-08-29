# Development Standards for UrbanForage

## Code Style and Structure

### TypeScript Standards
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use proper typing for React components and hooks
- Avoid `any` type - use proper type definitions

### Component Architecture
- Use functional components with hooks
- Implement proper prop typing with interfaces
- Use React.memo for performance optimization where needed
- Follow single responsibility principle

### File Naming Conventions
- Components: PascalCase (e.g., `FoodListingCard.tsx`)
- Hooks: camelCase starting with "use" (e.g., `useLocationData.ts`)
- Utils: camelCase (e.g., `formatDistance.ts`)
- Types: PascalCase with "Type" suffix (e.g., `FoodListingType.ts`)

## Styling with NativeWind

### Setup Requirements
- Use NativeWind for all styling (Tailwind CSS for React Native)
- Configure proper Tailwind classes for responsive design
- Use custom color palette defined in project overview
- Implement dark mode support with proper color schemes

### Styling Patterns
```tsx
// Use NativeWind classes for styling
<View className="flex-1 bg-cream-white dark:bg-gray-900">
  <Text className="text-forest-green text-lg font-bold mb-4">
    Fresh Local Produce
  </Text>
  <TouchableOpacity className="bg-sage-green px-6 py-3 rounded-full shadow-lg active:scale-95">
    <Text className="text-white font-semibold text-center">
      Discover Food
    </Text>
  </TouchableOpacity>
</View>
```

### Animation Standards
- Use React Native Reanimated 3 for complex animations
- Implement smooth transitions with spring physics
- Use `useNativeDriver: true` for performance
- Add haptic feedback for user interactions

## State Management

### Zustand Store Structure
```tsx
interface AppState {
  user: UserType | null;
  listings: FoodListingType[];
  filters: FilterState;
  location: LocationType | null;
}

const useAppStore = create<AppState>((set, get) => ({
  // State and actions
}));
```

### React Query Integration
- Use React Query for server state management
- Implement proper caching strategies
- Handle loading and error states consistently
- Use optimistic updates for better UX

## Firebase Integration

### Authentication
- Implement social login (Google, Apple, Facebook)
- Use Firebase Auth for user management
- Handle authentication state properly
- Implement proper error handling

### Firestore Database
- Use proper collection structure
- Implement real-time listeners where needed
- Use proper indexing for queries
- Handle offline scenarios

### Storage
- Optimize image uploads with compression
- Use proper file naming conventions
- Implement progress indicators for uploads
- Handle storage errors gracefully

## Code Quality and Linting

### Linting Requirements
- **IMPORTANT**: Run `npm run lint` after completing each task
- Fix all linting errors and warnings before considering a task complete
- Follow ESLint configuration for consistent code style
- Address TypeScript errors and warnings promptly

## Testing Standards

**Note: This project does not require any testing implementation. Focus on building functional, high-quality code without writing unit tests, integration tests, or any other testing code.**

## Performance Guidelines

### Image Optimization
- Use Expo Image for better performance
- Implement lazy loading for image lists
- Use appropriate image sizes and formats
- Cache images properly

### List Performance
- Use FlatList for large datasets
- Implement proper keyExtractor
- Use getItemLayout when possible
- Implement pull-to-refresh and infinite scroll

### Memory Management
- Clean up listeners and subscriptions
- Use useCallback and useMemo appropriately
- Avoid memory leaks in async operations
- Monitor performance with Flipper

## Security Best Practices

### Data Validation
- Validate all user inputs
- Sanitize data before storage
- Use proper form validation
- Handle edge cases gracefully

### Privacy
- Request permissions properly
- Handle location data securely
- Implement proper user consent flows
- Follow platform privacy guidelines

## Accessibility Standards

### Screen Reader Support
- Use proper accessibility labels
- Implement semantic markup
- Test with screen readers
- Provide alternative text for images

### Touch Targets
- Ensure minimum 44pt touch targets
- Provide proper focus indicators
- Support keyboard navigation
- Test with accessibility tools