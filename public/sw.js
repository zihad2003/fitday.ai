// public/sw.js
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time for your meal!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
  };
  event.waitUntil(
    self.registration.showNotification('FitDay AI Reminder', options)
  );
});