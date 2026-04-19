import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyCYoqyq7PHdqbvkpxf2QEg8-K87DYkSdnw',
  authDomain: 'shout-round.firebaseapp.com',
  projectId: 'shout-round',
  storageBucket: 'shout-round.firebasestorage.app',
  messagingSenderId: '348143932565',
  appId: '1:348143932565:web:0937ec011bd8981a3cf79c',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

function buildAuth() {
  if (Platform.OS === 'web') {
    return initializeAuth(app, { persistence: browserLocalPersistence });
  }
  // RN — dynamic require keeps both off web bundle
  const { getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
}

export const auth = buildAuth();
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

// TODO: re-enable App Check before production
// initializeAppCheck with ReCaptchaV3Provider (web) + DeviceCheck/PlayIntegrity (native)

export default app;
