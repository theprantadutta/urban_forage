# Design Document - Discovery Experience

## Overview

The Discovery Experience is the heart of UrbanForage, providing users with an intuitive and visually stunning way to explore local food listings. This phase focuses on creating a premium map interface, beautiful listing presentations, and powerful search capabilities that make finding local food feel magical and effortless.

## Architecture

### Component Hierarchy
```
DiscoveryScreen
├── MapView
│   ├── CustomMarkers
│   ├── MarkerClusters
│   └── LocationButton
├── SearchOverlay
│   ├── SearchBar
│   ├── FilterChips
│   └── QuickActions
├── ListingCards
│   ├── FoodCard
│   ├── ImageGallery
│   └── UserInfo
└── ListingModal
    ├── DetailView
    ├── ActionButtons
    └── ContactOptions
```

### Data Flow Architecture
```
User Interaction → State Management → API Calls → Real-time Updates → UI Updates
     ↓                    ↓              ↓              ↓              ↓
Search/Filter → Zustand Store → Firebase → Firestore → React Query → Component Re-render
```

## Components and Interfaces

### Map Components

#### CustomMapView
```tsx
interface MapViewProps {
  listings: FoodListing[];
  onListingPress: (listing: FoodListing) => void;
  onRegionChange: (region: Region) => void;
  userLocation: Location | null;
  selectedListing?: FoodListing;
  loading?: boolean;
}

const CustomMapView: React.FC<MapViewProps> = ({
  listings,
  onListingPress,
  onRegionChange,
  userLocation,
  selectedListing,
  loading = false
}) => {
  // Implementation with React Native Maps
  // Custom styling with seasonal themes
  // Marker clustering with smooth animations
  // Performance optimization for large datasets
};
```

#### AnimatedMarker
```tsx
interface MarkerProps {
  listing: FoodListing;
  onPress: () => void;
  selected?: boolean;
  category: FoodCategory;
  availability: 'high' | 'medium' | 'low';
}

const AnimatedMarker: React.FC<MarkerProps> = ({
  listing,
  onPress,
  selected = false,
  category,
  availability
}) => {
  // Custom marker with food category icons
  // Bounce animation on selection
  // Availability indicator with color coding
  // Smooth scale transitions
};
```

#### MarkerCluster
```tsx
interface ClusterProps {
  count: number;
  onPress: () => void;
  coordinate: LatLng;
  size: 'small' | 'medium' | 'large';
}

const MarkerCluster: React.FC<ClusterProps> = ({
  count,
  onPress,
  coordinate,
  size
}) => {
  // Pulsing animation effect
  // Dynamic sizing based on count
  // Smooth expansion/contraction
  // Category distribution visualization
};
```

### Search and Filter Components

#### SearchOverlay
```tsx
interface SearchOverlayProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterState) => void;
  filters: FilterState;
  suggestions: string[];
  loading?: boolean;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({
  onSearch,
  onFilterChange,
  filters,
  suggestions,
  loading = false
}) => {
  // Floating search bar with glassmorphism
  // Real-time search with debouncing
  // Filter chips with smooth animations
  // Search suggestions dropdown
};
```

#### FilterChip
```tsx
interface FilterChipProps {
  label: string;
  icon?: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  count?: number;
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  icon,
  selected,
  onPress,
  count
}) => {
  // Smooth selection animations
  // Category icons with proper theming
  // Item count badges
  // Haptic feedback on selection
};
```

### Listing Display Components

#### FoodListingCard
```tsx
interface FoodListingCardProps {
  listing: FoodListing;
  onPress: () => void;
  onFavorite: () => void;
  variant: 'grid' | 'list' | 'featured';
  index?: number;
}

const FoodListingCard: React.FC<FoodListingCardProps> = ({
  listing,
  onPress,
  onFavorite,
  variant = 'grid',
  index = 0
}) => {
  // High-quality image display with optimization
  // Parallax effects on scroll
  // Staggered entrance animations
  // Interactive favorite button with animation
  // User rating and distance display
};
```

#### ImageGallery
```tsx
interface ImageGalleryProps {
  images: string[];
  onImagePress: (index: number) => void;
  aspectRatio?: number;
  showIndicators?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onImagePress,
  aspectRatio = 16/9,
  showIndicators = true
}) => {
  // Smooth horizontal scrolling
  // Progressive image loading
  // Zoom and pan gestures
  // Page indicators with animations
};
```

#### ListingDetailModal
```tsx
interface ListingDetailModalProps {
  listing: FoodListing | null;
  visible: boolean;
  onClose: () => void;
  onMessage: () => void;
  onDirections: () => void;
  onFavorite: () => void;
}

const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  visible,
  onClose,
  onMessage,
  onDirections,
  onFavorite
}) => {
  // Full-screen modal with shared element transitions
  // Pull-to-dismiss gesture
  // Action buttons with haptic feedback
  // User profile integration
  // Related listings section
};
```

## Data Models

### Food Listing Model
```tsx
interface FoodListing {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: FoodCategory;
  subcategory?: string;
  quantity: {
    amount: number;
    unit: string;
    available: number;
  };
  location: {
    latitude: number;
    longitude: number;
    address: string;
    pickupInstructions?: string;
  };
  provider: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    verified: boolean;
  };
  availability: {
    status: 'available' | 'reserved' | 'claimed';
    expiresAt?: Date;
    pickupWindow?: {
      start: Date;
      end: Date;
    };
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    views: number;
    favorites: number;
    freshness: 'excellent' | 'good' | 'fair';
  };
  tags: string[];
}
```

### Food Category Model
```tsx
interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: string[];
}

const FOOD_CATEGORIES: FoodCategory[] = [
  {
    id: 'vegetables',
    name: 'Vegetables',
    icon: '🥕',
    color: '#22c55e',
    subcategories: ['leafy-greens', 'root-vegetables', 'peppers', 'tomatoes']
  },
  {
    id: 'fruits',
    name: 'Fruits',
    icon: '🍎',
    color: '#ef4444',
    subcategories: ['citrus', 'berries', 'stone-fruits', 'tropical']
  },
  {
    id: 'herbs',
    name: 'Herbs',
    icon: '🌿',
    color: '#10b981',
    subcategories: ['cooking-herbs', 'medicinal', 'aromatic']
  },
  {
    id: 'prepared',
    name: 'Prepared Foods',
    icon: '🍞',
    color: '#f59e0b',
    subcategories: ['baked-goods', 'preserves', 'meals']
  }
];
```

### Search and Filter State
```tsx
interface FilterState {
  query: string;
  categories: string[];
  distance: {
    max: number;
    unit: 'km' | 'miles';
  };
  availability: 'all' | 'available' | 'pickup-today';
  freshness: 'all' | 'excellent' | 'good-or-better';
  sortBy: 'distance' | 'newest' | 'popularity' | 'freshness';
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}
```

### Map State
```tsx
interface MapState {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markers: MarkerData[];
  clusters: ClusterData[];
  selectedMarker?: string;
  userLocation?: Location;
  followUser: boolean;
}
```

## Error Handling

### Map Error Scenarios
- **Location Permission Denied**: Show manual location selection with search
- **Network Connectivity Issues**: Display cached listings with offline indicator
- **Map Loading Failures**: Provide fallback list view with retry option
- **GPS Accuracy Issues**: Show accuracy indicator and allow manual adjustment

### Search Error Handling
- **No Results Found**: Display helpful suggestions and expand search radius
- **Search Service Unavailable**: Fall back to cached results and local filtering
- **Invalid Search Queries**: Provide search suggestions and auto-correction
- **Filter Conflicts**: Automatically resolve conflicts and notify user

### Image Loading Errors
- **Failed Image Loads**: Show placeholder with retry option
- **Slow Network**: Progressive loading with low-quality placeholders
- **Storage Errors**: Graceful fallback to default images
- **Format Issues**: Automatic format conversion and optimization

## Performance Optimizations

### Map Performance
```tsx
// Marker clustering optimization
const useMarkerClustering = (listings: FoodListing[], region: Region) => {
  return useMemo(() => {
    return clusterMarkers(listings, region, {
      radius: 50,
      maxZoom: 15,
      minPoints: 2
    });
  }, [listings, region]);
};

// Viewport-based rendering
const useViewportListings = (listings: FoodListing[], region: Region) => {
  return useMemo(() => {
    return listings.filter(listing => 
      isInViewport(listing.location, region)
    );
  }, [listings, region]);
};
```

### Image Optimization
```tsx
// Progressive image loading
const useProgressiveImage = (src: string) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lowQualityLoaded, setLowQualityLoaded] = useState(false);
  
  const lowQualitySrc = useMemo(() => 
    generateLowQualityUrl(src), [src]
  );
  
  return {
    src: imageLoaded ? src : lowQualitySrc,
    loaded: imageLoaded,
    placeholder: !lowQualityLoaded
  };
};
```

### List Performance
```tsx
// Virtualized list rendering
const ListingList = ({ listings }: { listings: FoodListing[] }) => {
  const renderItem = useCallback(({ item, index }: ListRenderItemInfo<FoodListing>) => (
    <FoodListingCard
      listing={item}
      index={index}
      onPress={() => handleListingPress(item)}
      onFavorite={() => handleFavorite(item.id)}
    />
  ), []);

  const keyExtractor = useCallback((item: FoodListing) => item.id, []);

  return (
    <FlatList
      data={listings}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
    />
  );
};
```

## Animation Specifications

### Map Animations
- **Marker Appearance**: Scale from 0 to 1 with bounce effect
- **Cluster Formation**: Smooth morphing with spring physics
- **Selection States**: Gentle bounce with color transition
- **Region Changes**: Smooth camera movements with easing

### Card Animations
- **Entrance**: Staggered slide-up with fade-in (100ms delay between items)
- **Press States**: Scale down to 0.95 with haptic feedback
- **Favorite Toggle**: Heart scale animation with particle effects
- **Image Loading**: Fade transition from placeholder to full image

### Modal Transitions
- **Open**: Shared element transition with backdrop fade
- **Close**: Pull-to-dismiss with spring physics
- **Content**: Parallax scrolling with header collapse
- **Actions**: Button press animations with color feedback

## Accessibility Considerations

### Screen Reader Support
```tsx
// Proper accessibility labels for map markers
<Marker
  accessibilityLabel={`${listing.title}, ${listing.category}, ${distance} away`}
  accessibilityHint="Double tap to view details"
  accessibilityRole="button"
>
```

### Keyboard Navigation
- Tab order optimization for search and filters
- Proper focus management in modals
- Keyboard shortcuts for common actions
- Voice control integration

### Visual Accessibility
- High contrast mode support
- Proper color contrast ratios (4.5:1 minimum)
- Text scaling support up to 200%
- Motion reduction preferences

## Real-time Features

### Firebase Integration
```tsx
// Real-time listing updates
const useRealtimeListings = (filters: FilterState) => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  
  useEffect(() => {
    const query = buildFirestoreQuery(filters);
    const unsubscribe = onSnapshot(query, (snapshot) => {
      const updatedListings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FoodListing[];
      
      setListings(updatedListings);
    });
    
    return unsubscribe;
  }, [filters]);
  
  return listings;
};
```

### Push Notifications
```tsx
// Notification handling for new listings
const useNotificationHandler = () => {
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        if (notification.request.content.data?.type === 'new_listing') {
          // Handle new listing notification
          showInAppNotification(notification);
        }
      }
    );
    
    return () => subscription.remove();
  }, []);
};
```