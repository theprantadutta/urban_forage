import { useCallback, useMemo, useState } from 'react';
import type { FoodListing } from '../components/map/FoodMarker';
import type { AdvancedFilterOptions } from '../components/search/AdvancedFilters';
import type { ActiveFilter, FilterOption } from '../components/search/FilterChips';

interface UseSearchAndFilterOptions {
  initialFilters?: Partial<AdvancedFilterOptions>;
}

interface UseSearchAndFilterReturn {
  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Filter state
  activeFilters: ActiveFilter[];
  advancedFilters: AdvancedFilterOptions;
  
  // Filter actions
  toggleFilter: (filter: FilterOption) => void;
  removeFilter: (filterId: string) => void;
  clearAllFilters: () => void;
  updateAdvancedFilters: (filters: AdvancedFilterOptions) => void;
  resetAdvancedFilters: () => void;
  
  // Filtered results
  filteredListings: FoodListing[];
  
  // Helper functions
  applyFiltersToListings: (listings: FoodListing[]) => FoodListing[];
}

const DEFAULT_ADVANCED_FILTERS: AdvancedFilterOptions = {
  maxDistance: 5,
  availabilityStatus: ['high', 'medium', 'low'],
  urgentOnly: false,
  freshnessHours: 24,
  sortBy: 'distance',
  sortOrder: 'asc',
};

// Helper function to calculate distance (mock implementation)
const calculateDistance = (listing: FoodListing): number => {
  // In a real app, this would calculate actual distance from user location
  // For now, we'll use the mock distance from the listing
  const distanceStr = listing.distance || '0 km';
  return parseFloat(distanceStr.replace(' km', ''));
};

// Helper function to calculate freshness score
const calculateFreshness = (listing: FoodListing): number => {
  // Mock freshness calculation based on timeLeft
  const timeLeft = listing.timeLeft || '24 hours';
  const hours = parseInt(timeLeft.split(' ')[0]);
  return 24 - hours; // Higher score = fresher
};

// Helper function to calculate popularity score
const calculatePopularity = (listing: FoodListing): number => {
  // Mock popularity calculation
  const baseScore = listing.availability === 'high' ? 3 : listing.availability === 'medium' ? 2 : 1;
  const urgentBonus = listing.isUrgent ? 2 : 0;
  return baseScore + urgentBonus;
};

export const useSearchAndFilter = (
  listings: FoodListing[],
  options: UseSearchAndFilterOptions = {}
): UseSearchAndFilterReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterOptions>({
    ...DEFAULT_ADVANCED_FILTERS,
    ...options.initialFilters,
  });

  // Toggle filter
  const toggleFilter = useCallback((filter: FilterOption) => {
    setActiveFilters(prev => {
      const existingIndex = prev.findIndex(f => f.id === filter.id);
      
      if (existingIndex >= 0) {
        // Remove existing filter
        return prev.filter((_, index) => index !== existingIndex);
      } else {
        // Add new filter
        const newFilter: ActiveFilter = {
          id: filter.id,
          label: filter.label,
          value: filter.id,
          type: filter.type,
        };
        return [...prev, newFilter];
      }
    });
  }, []);

  // Remove filter
  const removeFilter = useCallback((filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setActiveFilters([]);
    setAdvancedFilters(DEFAULT_ADVANCED_FILTERS);
  }, []);

  // Update advanced filters
  const updateAdvancedFilters = useCallback((filters: AdvancedFilterOptions) => {
    setAdvancedFilters(filters);
  }, []);

  // Reset advanced filters
  const resetAdvancedFilters = useCallback(() => {
    setAdvancedFilters(DEFAULT_ADVANCED_FILTERS);
  }, []);

  // Apply filters to listings
  const applyFiltersToListings = useCallback((inputListings: FoodListing[]): FoodListing[] => {
    let filtered = [...inputListings];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(query) ||
        listing.category.toLowerCase().includes(query)
      );
    }

    // Apply active filters
    activeFilters.forEach(filter => {
      switch (filter.type) {
        case 'category':
          filtered = filtered.filter(listing => listing.category === filter.id);
          break;
        case 'availability':
          if (filter.id === 'available-now') {
            filtered = filtered.filter(listing => listing.availability === 'high');
          } else if (filter.id === 'pickup-today') {
            filtered = filtered.filter(listing => {
              const timeLeft = listing.timeLeft || '';
              return timeLeft.includes('hour') || timeLeft.includes('today');
            });
          }
          break;
        case 'special':
          if (filter.id === 'urgent') {
            filtered = filtered.filter(listing => listing.isUrgent);
          } else if (filter.id === 'organic') {
            filtered = filtered.filter(listing => 
              listing.title.toLowerCase().includes('organic') ||
              listing.category === 'vegetables' || 
              listing.category === 'fruits'
            );
          }
          break;
        case 'distance':
          if (filter.id === 'nearby') {
            filtered = filtered.filter(listing => calculateDistance(listing) < 1);
          } else if (filter.id === 'walking') {
            filtered = filtered.filter(listing => calculateDistance(listing) < 2);
          }
          break;
        case 'freshness':
          if (filter.id === 'fresh-today') {
            filtered = filtered.filter(listing => {
              const timeLeft = listing.timeLeft || '';
              const hours = parseInt(timeLeft.split(' ')[0]);
              return hours <= 12;
            });
          }
          break;
      }
    });

    // Apply advanced filters
    // Distance filter
    filtered = filtered.filter(listing => 
      calculateDistance(listing) <= advancedFilters.maxDistance
    );

    // Availability status filter
    filtered = filtered.filter(listing =>
      advancedFilters.availabilityStatus.includes(listing.availability)
    );

    // Urgent only filter
    if (advancedFilters.urgentOnly) {
      filtered = filtered.filter(listing => listing.isUrgent);
    }

    // Freshness filter
    filtered = filtered.filter(listing => {
      const timeLeft = listing.timeLeft || '24 hours';
      const hours = parseInt(timeLeft.split(' ')[0]);
      return hours <= advancedFilters.freshnessHours;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (advancedFilters.sortBy) {
        case 'distance':
          comparison = calculateDistance(a) - calculateDistance(b);
          break;
        case 'newest':
          // Mock: assume listings with shorter timeLeft are newer
          const aHours = parseInt((a.timeLeft || '24 hours').split(' ')[0]);
          const bHours = parseInt((b.timeLeft || '24 hours').split(' ')[0]);
          comparison = bHours - aHours; // Newer first (less time left = more recent)
          break;
        case 'popularity':
          comparison = calculatePopularity(b) - calculatePopularity(a);
          break;
        case 'freshness':
          comparison = calculateFreshness(b) - calculateFreshness(a);
          break;
      }

      return advancedFilters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [searchQuery, activeFilters, advancedFilters]);

  // Get filtered listings
  const filteredListings = useMemo(() => {
    return applyFiltersToListings(listings);
  }, [listings, applyFiltersToListings]);

  return {
    searchQuery,
    setSearchQuery,
    activeFilters,
    advancedFilters,
    toggleFilter,
    removeFilter,
    clearAllFilters,
    updateAdvancedFilters,
    resetAdvancedFilters,
    filteredListings,
    applyFiltersToListings,
  };
};