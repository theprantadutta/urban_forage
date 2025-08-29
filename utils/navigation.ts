import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { NAVIGATION_PERSISTENCE_KEY, routeAccessControl } from '../config/navigation';
import { NavigationState } from '../types/navigation';

/**
 * Navigation utility class for managing app navigation
 */
export class NavigationUtils {
  private static navigationState: NavigationState = {
    currentRoute: '/',
    tabHistory: [],
    canGoBack: false,
  };

  /**
   * Navigate to a route with optional parameters
   */
  static navigate(route: string, params?: Record<string, any>) {
    try {
      if (params) {
        router.push({ pathname: route as any, params });
      } else {
        router.push(route as any);
      }
      this.updateNavigationState(route);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  /**
   * Replace current route
   */
  static replace(route: string, params?: Record<string, any>) {
    try {
      if (params) {
        router.replace({ pathname: route as any, params });
      } else {
        router.replace(route as any);
      }
      this.updateNavigationState(route);
    } catch (error) {
      console.error('Navigation replace error:', error);
    }
  }

  /**
   * Go back to previous screen
   */
  static goBack() {
    try {
      if (router.canGoBack()) {
        router.back();
        this.updateNavigationStateOnBack();
      }
    } catch (error) {
      console.error('Navigation back error:', error);
    }
  }

  /**
   * Navigate to tab
   */
  static navigateToTab(tabName: string) {
    try {
      router.push(`/(tabs)/${tabName}` as any);
      this.updateTabHistory(tabName);
    } catch (error) {
      console.error('Tab navigation error:', error);
    }
  }

  /**
   * Check if user can access a route
   */
  static canAccessRoute(route: string, isAuthenticated: boolean, hasCompletedOnboarding: boolean): boolean {
    // Check public routes
    if (routeAccessControl.public.includes(route as any)) {
      return true;
    }

    // Check onboarding required routes
    if (routeAccessControl.onboardingRequired.includes(route as any)) {
      return !hasCompletedOnboarding;
    }

    // Check authenticated routes
    if (routeAccessControl.authenticated.includes(route as any)) {
      return isAuthenticated && hasCompletedOnboarding;
    }

    // Default to requiring authentication
    return isAuthenticated && hasCompletedOnboarding;
  }

  /**
   * Get appropriate route based on user state
   */
  static getInitialRoute(isAuthenticated: boolean, hasCompletedOnboarding: boolean): string {
    if (!hasCompletedOnboarding) {
      return '/onboarding';
    }
    
    if (!isAuthenticated) {
      return '/auth/signin';
    }
    
    return '/(tabs)';
  }

  /**
   * Update navigation state
   */
  private static updateNavigationState(newRoute: string) {
    const previousRoute = this.navigationState.currentRoute;
    this.navigationState = {
      ...this.navigationState,
      currentRoute: newRoute,
      previousRoute,
      canGoBack: router.canGoBack(),
    };
  }

  /**
   * Update navigation state when going back
   */
  private static updateNavigationStateOnBack() {
    this.navigationState = {
      ...this.navigationState,
      currentRoute: this.navigationState.previousRoute || '/',
      canGoBack: router.canGoBack(),
    };
  }

  /**
   * Update tab history
   */
  private static updateTabHistory(tabName: string) {
    const history = [...this.navigationState.tabHistory];
    const existingIndex = history.indexOf(tabName);
    
    if (existingIndex > -1) {
      history.splice(existingIndex, 1);
    }
    
    history.push(tabName);
    
    // Keep only last 5 tabs in history
    if (history.length > 5) {
      history.shift();
    }
    
    this.navigationState.tabHistory = history;
  }

  /**
   * Get current navigation state
   */
  static getNavigationState(): NavigationState {
    return { ...this.navigationState };
  }

  /**
   * Save navigation state to storage
   */
  static async saveNavigationState() {
    try {
      await AsyncStorage.setItem(
        NAVIGATION_PERSISTENCE_KEY,
        JSON.stringify(this.navigationState)
      );
    } catch (error) {
      console.error('Error saving navigation state:', error);
    }
  }

  /**
   * Restore navigation state from storage
   */
  static async restoreNavigationState(): Promise<NavigationState | null> {
    try {
      const savedState = await AsyncStorage.getItem(NAVIGATION_PERSISTENCE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        this.navigationState = { ...this.navigationState, ...parsedState };
        return parsedState;
      }
    } catch (error) {
      console.error('Error restoring navigation state:', error);
    }
    return null;
  }

  /**
   * Clear navigation state
   */
  static clearNavigationState() {
    this.navigationState = {
      currentRoute: '/',
      tabHistory: [],
      canGoBack: false,
    };
  }

  /**
   * Generate deep link URL
   */
  static generateDeepLink(route: string, params?: Record<string, any>): string {
    let url = `urbanforage://app${route}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }
    
    return url;
  }

  /**
   * Parse deep link URL
   */
  static parseDeepLink(url: string): { route: string; params: Record<string, any> } {
    try {
      const urlObj = new URL(url);
      const route = urlObj.pathname.replace('/app', '') || '/';
      const params: Record<string, any> = {};
      
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      return { route, params };
    } catch (error) {
      console.error('Error parsing deep link:', error);
      return { route: '/', params: {} };
    }
  }

  /**
   * Handle deep link navigation
   */
  static handleDeepLink(url: string, isAuthenticated: boolean, hasCompletedOnboarding: boolean) {
    const { route, params } = this.parseDeepLink(url);
    
    if (this.canAccessRoute(route, isAuthenticated, hasCompletedOnboarding)) {
      this.navigate(route, params);
    } else {
      // Redirect to appropriate screen based on user state
      const initialRoute = this.getInitialRoute(isAuthenticated, hasCompletedOnboarding);
      this.replace(initialRoute);
    }
  }
}

/**
 * Hook for navigation utilities
 */
export const useNavigationUtils = () => {
  return {
    navigate: NavigationUtils.navigate,
    replace: NavigationUtils.replace,
    goBack: NavigationUtils.goBack,
    navigateToTab: NavigationUtils.navigateToTab,
    canAccessRoute: NavigationUtils.canAccessRoute,
    getInitialRoute: NavigationUtils.getInitialRoute,
    getNavigationState: NavigationUtils.getNavigationState,
    generateDeepLink: NavigationUtils.generateDeepLink,
    parseDeepLink: NavigationUtils.parseDeepLink,
    handleDeepLink: NavigationUtils.handleDeepLink,
  };
};