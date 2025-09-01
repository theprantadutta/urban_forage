import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Firestore, connectFirestoreEmulator, doc, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, connectStorageEmulator, getStorage } from 'firebase/storage';
import { isDevelopment, isFirebaseConfigured, logFirebaseOperation } from '../utils/firebase';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate configuration
if (!isFirebaseConfigured()) {
  console.error('❌ Firebase configuration is incomplete. Please check your environment variables.');
  throw new Error('Firebase configuration is incomplete');
}

// Initialize Firebase app
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  logFirebaseOperation('initializeApp', { projectId: firebaseConfig.projectId });
} else {
  app = getApps()[0];
}

// Initialize Firebase Auth with AsyncStorage persistence
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  logFirebaseOperation('initializeAuth', { persistence: 'AsyncStorage' });
} catch (error) {
  // If auth is already initialized, get the existing instance
  auth = getAuth(app);
  logFirebaseOperation('getAuth', { existing: true });
}

// Initialize Firestore
const db: Firestore = getFirestore(app);
logFirebaseOperation('initializeFirestore', { projectId: firebaseConfig.projectId });

// Initialize Storage
const storage: FirebaseStorage = getStorage(app);
logFirebaseOperation('initializeStorage', { bucket: firebaseConfig.storageBucket });

// Connect to emulators in development
if (isDevelopment()) {
  const EMULATOR_HOST = 'localhost';
  
  try {
    // Connect Firestore emulator
    connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
    logFirebaseOperation('connectFirestoreEmulator', { host: EMULATOR_HOST, port: 8080 });
  } catch (error) {
    // Emulator already connected or not available
    logFirebaseOperation('firestoreEmulatorConnection', { error: 'Already connected or not available' });
  }

  try {
    // Connect Storage emulator
    connectStorageEmulator(storage, EMULATOR_HOST, 9199);
    logFirebaseOperation('connectStorageEmulator', { host: EMULATOR_HOST, port: 9199 });
  } catch (error) {
    // Emulator already connected or not available
    logFirebaseOperation('storageEmulatorConnection', { error: 'Already connected or not available' });
  }
}

// Export Firebase services
export { app, auth, db, storage };

// Export configuration for debugging
export const getFirebaseConfig = () => ({
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  isDevelopment: isDevelopment(),
  isConfigured: isFirebaseConfigured(),
});

// Health check function
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Simple Firestore read to test connection
    const testDoc = doc(db, 'test', 'connection');
    await testDoc;
    logFirebaseOperation('healthCheck', { status: 'connected' });
    return true;
  } catch (error) {
    logFirebaseOperation('healthCheck', { status: 'failed', error });
    return false;
  }
};

export default app;