import {
    collection,
    doc,
    DocumentData,
    DocumentSnapshot,
    GeoPoint,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    QueryConstraint,
    QuerySnapshot,
    Timestamp,
    Unsubscribe,
    updateDoc,
    where
} from 'firebase/firestore';
import type { FoodListing } from '../components/map/FoodMarker';
import { db } from '../config/firebase';
import { COLLECTIONS, LISTING_STATUS } from '../constants/firebase';
import { logFirebaseOperation } from '../utils/firebase';

// Types for Firestore documents
export interface FirestoreFoodListing {
  id: string;
  title: string;
  description: string;
  category: 'vegetables' | 'fruits' | 'bakery' | 'dairy' | 'prepared' | 'other';
  availability: 'high' | 'medium' | 'low';
  location: GeoPoint;
  address: string;
  provider: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  images: string[];
  quantity: string;
  expiresAt: Timestamp;
  pickupInstructions?: string;
  status: keyof typeof LISTING_STATUS;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  rating?: number;
  reviewCount?: number;
  isUrgent?: boolean;
  tags?: string[];
}

export interface ListingFilters {
  category?: string[];
  availability?: string[];
  maxDistance?: number;
  userLocation?: { latitude: number; longitude: number };
  searchQuery?: string;
  status?: string[];
}

export interface ViewportBounds {
  northEast: { latitude: number; longitude: number };
  southWest: { latitude: number; longitude: number };
}

/**
 * Convert Firestore document to FoodListing
 */
const convertFirestoreToFoodListing = (
  doc: DocumentSnapshot<DocumentData>,
  userLocation?: { latitude: number; longitude: number }
): FoodListing | null => {
  if (!doc.exists()) return null;

  const data = doc.data() as FirestoreFoodListing;
  const location = data.location;
  
  // Calculate distance if user location is provided
  let distance: string | undefined;
  if (userLocation && location) {
    const distanceKm = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      location.latitude,
      location.longitude
    );
    distance = distanceKm < 1 
      ? `${Math.round(distanceKm * 1000)}m` 
      : `${distanceKm.toFixed(1)}km`;
  }

  // Calculate time left until expiration
  const timeLeft = calculateTimeLeft(data.expiresAt);

  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    category: data.category,
    availability: data.availability,
    latitude: location.latitude,
    longitude: location.longitude,
    distance,
    timeLeft,
    isUrgent: data.isUrgent || isUrgent(data.expiresAt),
    image: data.images[0] || '',
    provider: data.provider.name,
    location: data.address,
    rating: data.rating,
    reviewCount: data.reviewCount,
    isVerified: data.provider.verified,
    quantity: data.quantity,
    expiresAt: formatExpirationDate(data.expiresAt),
    pickupInstructions: data.pickupInstructions,
  };
};

/**
 * Calculate distance between two coordinates in kilometers
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Calculate time left until expiration
 */
const calculateTimeLeft = (expiresAt: Timestamp): string => {
  const now = new Date();
  const expiration = expiresAt.toDate();
  const diffMs = expiration.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Expired';
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
};

/**
 * Check if listing is urgent (expires within 2 hours)
 */
const isUrgent = (expiresAt: Timestamp): boolean => {
  const now = new Date();
  const expiration = expiresAt.toDate();
  const diffMs = expiration.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= 2 && diffHours > 0;
};

/**
 * Format expiration date for display
 */
const formatExpirationDate = (expiresAt: Timestamp): string => {
  const expiration = expiresAt.toDate();
  const now = new Date();
  const diffMs = expiration.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays > 1) return `in ${diffDays} days`;
  return 'expired';
};

/**
 * Subscribe to food listings with real-time updates
 */
export const subscribeToListings = (
  filters: ListingFilters,
  onUpdate: (listings: FoodListing[]) => void,
  viewport?: ViewportBounds,
  onError?: (error: Error) => void
): Unsubscribe => {
  try {
    logFirebaseOperation('subscribeToListings', { filters, viewport });

    // Build query constraints
    const constraints: QueryConstraint[] = [
      where('status', '==', LISTING_STATUS.ACTIVE),
      orderBy('createdAt', 'desc'),
    ];

    // Add category filter
    if (filters.category && filters.category.length > 0) {
      constraints.push(where('category', 'in', filters.category));
    }

    // Add availability filter
    if (filters.availability && filters.availability.length > 0) {
      constraints.push(where('availability', 'in', filters.availability));
    }

    // Limit results for performance
    constraints.push(limit(100));

    const q = query(collection(db, COLLECTIONS.LISTINGS), ...constraints);

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const listings: FoodListing[] = [];
        
        snapshot.forEach((doc) => {
          const listing = convertFirestoreToFoodListing(doc, filters.userLocation);
          if (listing) {
            // Apply viewport filtering if provided
            if (viewport) {
              const { latitude, longitude } = listing;
              const inViewport = 
                latitude <= viewport.northEast.latitude &&
                latitude >= viewport.southWest.latitude &&
                longitude <= viewport.northEast.longitude &&
                longitude >= viewport.southWest.longitude;
              
              if (inViewport) {
                listings.push(listing);
              }
            } else {
              listings.push(listing);
            }
          }
        });

        // Apply distance filtering
        let filteredListings = listings;
        if (filters.maxDistance && filters.userLocation) {
          filteredListings = listings.filter(listing => {
            if (!listing.distance) return false;
            const distanceValue = parseFloat(listing.distance.replace(/[^\d.]/g, ''));
            const distanceUnit = listing.distance.includes('m') ? 0.001 : 1;
            const distanceKm = distanceValue * distanceUnit;
            return distanceKm <= filters.maxDistance!;
          });
        }

        // Apply search query filtering
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredListings = filteredListings.filter(listing =>
            listing.title.toLowerCase().includes(query) ||
            listing.description.toLowerCase().includes(query) ||
            listing.provider.toLowerCase().includes(query) ||
            listing.category.toLowerCase().includes(query)
          );
        }

        logFirebaseOperation('listingsUpdated', { count: filteredListings.length });
        onUpdate(filteredListings);
      },
      (error) => {
        console.error('Error in listings subscription:', error);
        onError?.(error);
      }
    );
  } catch (error) {
    console.error('Error setting up listings subscription:', error);
    onError?.(error as Error);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Subscribe to a specific listing
 */
export const subscribeToListing = (
  listingId: string,
  onUpdate: (listing: FoodListing | null) => void,
  onError?: (error: Error) => void,
  userLocation?: { latitude: number; longitude: number }
): Unsubscribe => {
  try {
    logFirebaseOperation('subscribeToListing', { listingId });

    const docRef = doc(db, COLLECTIONS.LISTINGS, listingId);

    return onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        const listing = convertFirestoreToFoodListing(snapshot, userLocation);
        logFirebaseOperation('listingUpdated', { listingId, exists: !!listing });
        onUpdate(listing);
      },
      (error) => {
        console.error('Error in listing subscription:', error);
        onError?.(error);
      }
    );
  } catch (error) {
    console.error('Error setting up listing subscription:', error);
    onError?.(error as Error);
    return () => {};
  }
};

/**
 * Get listings once (no real-time updates)
 */
export const getListings = async (
  filters: ListingFilters,
  viewport?: ViewportBounds
): Promise<FoodListing[]> => {
  try {
    logFirebaseOperation('getListings', { filters, viewport });

    const constraints: QueryConstraint[] = [
      where('status', '==', LISTING_STATUS.ACTIVE),
      orderBy('createdAt', 'desc'),
      limit(100),
    ];

    if (filters.category && filters.category.length > 0) {
      constraints.push(where('category', 'in', filters.category));
    }

    if (filters.availability && filters.availability.length > 0) {
      constraints.push(where('availability', 'in', filters.availability));
    }

    const q = query(collection(db, COLLECTIONS.LISTINGS), ...constraints);
    const snapshot = await getDocs(q);

    const listings: FoodListing[] = [];
    snapshot.forEach((doc) => {
      const listing = convertFirestoreToFoodListing(doc, filters.userLocation);
      if (listing) {
        listings.push(listing);
      }
    });

    logFirebaseOperation('listingsRetrieved', { count: listings.length });
    return listings;
  } catch (error) {
    console.error('Error getting listings:', error);
    throw error;
  }
};

/**
 * Update listing status
 */
export const updateListingStatus = async (
  listingId: string,
  status: keyof typeof LISTING_STATUS
): Promise<void> => {
  try {
    logFirebaseOperation('updateListingStatus', { listingId, status });

    const docRef = doc(db, COLLECTIONS.LISTINGS, listingId);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });

    logFirebaseOperation('listingStatusUpdated', { listingId, status });
  } catch (error) {
    console.error('Error updating listing status:', error);
    throw error;
  }
};

export default {
  subscribeToListings,
  subscribeToListing,
  getListings,
  updateListingStatus,
};