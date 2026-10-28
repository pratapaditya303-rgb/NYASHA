// Firebase Cloud Messaging Service Worker for Nyaay Sahayogi / Bar Advocate Connect
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCF6iHdbCygnQDxzhrQWhEqd9kDx2DQtjQ",
  authDomain: "gen-lang-client-0118328707.firebaseapp.com",
  projectId: "gen-lang-client-0118328707",
  storageBucket: "gen-lang-client-0118328707.firebasestorage.app",
  messagingSenderId: "310045017787",
  appId: "1:310045017787:web:6f8d83329ee958940e8b9e"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || '⚖️ न्याय सहयोगी - बार एसोसिएशन सूचना';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.message || 'नई बार एसोसिएशन सूचना / अपडेट प्राप्त हुआ है।',
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200],
    tag: payload.data?.tag || 'bar-notice-alert',
    data: {
      url: payload.data?.url || self.location.origin
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || self.location.origin;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
