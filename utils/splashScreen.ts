import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';

// Keep splash screen visible while app is loading
SplashScreen.preventAutoHideAsync();

interface SplashScreenManager {
  isReady: boolean;
  hideSplashScreen: () => Promise<void>;
}

// Track app initialization tasks
interface InitializationTask {
  name: string;
  task: () => Promise<void>;
  priority: 'high' | 'medium' | 'low';
  timeout?: number;
}

class AppInitializer {
  private tasks: InitializationTask[] = [];
  private completedTasks: Set<string> = new Set();
  private isInitialized = false;
  private listeners: ((progress: number) => void)[] = [];

  // Add initialization task
  addTask(task: InitializationTask): void {
    this.tasks.push(task);
  }

  // Run all initialization tasks
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Sort tasks by priority
    const sortedTasks = this.tasks.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Run high priority tasks first (blocking)
    const highPriorityTasks = sortedTasks.filter(t => t.priority === 'high');
    await this.runTasks(highPriorityTasks, true);

    // Run medium priority tasks (blocking)
    const mediumPriorityTasks = sortedTasks.filter(t => t.priority === 'medium');
    await this.runTasks(mediumPriorityTasks, true);

    // Run low priority tasks (non-blocking)
    const lowPriorityTasks = sortedTasks.filter(t => t.priority === 'low');
    this.runTasks(lowPriorityTasks, false); // Don't await

    this.isInitialized = true;
  }

  private async runTasks(tasks: InitializationTask[], blocking: boolean): Promise<void> {
    const promises = tasks.map(async (task) => {
      try {
        const timeoutPromise = task.timeout
          ? new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Task ${task.name} timed out`)), task.timeout)
            )
          : null;

        const taskPromise = task.task();
        
        if (timeoutPromise) {
          await Promise.race([taskPromise, timeoutPromise]);
        } else {
          await taskPromise;
        }

        this.completedTasks.add(task.name);
        this.notifyProgress();
      } catch (error) {
        console.warn(`Initialization task '${task.name}' failed:`, error);
        // Don't let one task failure block others
      }
    });

    if (blocking) {
      await Promise.allSettled(promises);
    }
  }

  private notifyProgress(): void {
    const progress = this.completedTasks.size / this.tasks.length;
    this.listeners.forEach(listener => listener(progress));
  }

  // Add progress listener
  addProgressListener(callback: (progress: number) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get initialization status
  getStatus(): { isInitialized: boolean; completedTasks: string[]; totalTasks: number } {
    return {
      isInitialized: this.isInitialized,
      completedTasks: Array.from(this.completedTasks),
      totalTasks: this.tasks.length,
    };
  }
}

// Global app initializer
export const appInitializer = new AppInitializer();

// Hook for managing splash screen
export const useSplashScreen = (): SplashScreenManager => {
  const [isReady, setIsReady] = useState(false);

  const hideSplashScreen = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (error) {
      console.warn('Error hiding splash screen:', error);
    }
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Run initialization tasks
        await appInitializer.initialize();
        
        // Small delay to ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsReady(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsReady(true); // Still show app even if some tasks failed
      }
    };

    initializeApp();
  }, []);

  return {
    isReady,
    hideSplashScreen,
  };
};

// Common initialization tasks
export const InitializationTasks = {
  // Load fonts
  loadFonts: (): InitializationTask => ({
    name: 'loadFonts',
    priority: 'high',
    timeout: 5000,
    task: async () => {
      // Font loading logic would go here
      console.log('Fonts loaded');
    },
  }),

  // Initialize theme
  initializeTheme: (): InitializationTask => ({
    name: 'initializeTheme',
    priority: 'high',
    timeout: 2000,
    task: async () => {
      // Theme initialization logic
      console.log('Theme initialized');
    },
  }),

  // Load user preferences
  loadUserPreferences: (): InitializationTask => ({
    name: 'loadUserPreferences',
    priority: 'medium',
    timeout: 3000,
    task: async () => {
      // Load user settings from storage
      console.log('User preferences loaded');
    },
  }),

  // Initialize analytics
  initializeAnalytics: (): InitializationTask => ({
    name: 'initializeAnalytics',
    priority: 'low',
    timeout: 5000,
    task: async () => {
      // Analytics initialization
      console.log('Analytics initialized');
    },
  }),

  // Preload critical data
  preloadCriticalData: (): InitializationTask => ({
    name: 'preloadCriticalData',
    priority: 'medium',
    timeout: 10000,
    task: async () => {
      // Preload essential app data
      console.log('Critical data preloaded');
    },
  }),

  // Initialize push notifications
  initializePushNotifications: (): InitializationTask => ({
    name: 'initializePushNotifications',
    priority: 'low',
    timeout: 5000,
    task: async () => {
      // Push notification setup
      console.log('Push notifications initialized');
    },
  }),
};