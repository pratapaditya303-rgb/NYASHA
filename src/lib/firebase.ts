import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore targeting the specific database ID
export const firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(firebaseApp);

// Initialize Messaging (FCM) conditionally
export const getFcmMessaging = async () => {
  try {
    const supported = await isMessagingSupported();
    if (supported && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      return getMessaging(firebaseApp);
    }
  } catch (err) {
    console.warn('FCM Messaging not supported in current environment:', err);
  }
  return null;
};
