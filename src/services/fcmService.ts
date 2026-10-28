import { getToken, onMessage } from 'firebase/messaging';
import { getFcmMessaging } from '../lib/firebase';

export async function requestNotificationPermissionAndGetToken(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Browser does not support desktop notifications');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Register service worker if not already registered
      let registration: ServiceWorkerRegistration | undefined;
      if ('serviceWorker' in navigator) {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js').catch((err) => {
          console.warn('Service Worker registration failed:', err);
          return undefined;
        });
      }

      const messaging = await getFcmMessaging();
      if (messaging) {
        const currentToken = await getToken(messaging, {
          serviceWorkerRegistration: registration,
          vapidKey: 'BPHy..._PLACEHOLDER_KEY' // Optional VAPID key
        }).catch((err) => {
          console.warn('FCM Token generation error:', err);
          return null;
        });

        if (currentToken) {
          console.log('FCM Token generated:', currentToken);
          localStorage.setItem('_nyaay_fcm_token', currentToken);
          return currentToken;
        }
      }
    } else {
      console.warn('Notification permission denied by user.');
    }
  } catch (err) {
    console.error('An error occurred while requesting notification permission:', err);
  }
  return null;
}

export async function listenToForegroundPushMessages(callback: (payload: any) => void) {
  try {
    const messaging = await getFcmMessaging();
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Foreground FCM Message received:', payload);
        callback(payload);
      });
    }
  } catch (err) {
    console.warn('Foreground message listener setup failed:', err);
  }
}
