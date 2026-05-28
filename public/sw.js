// Force unregister old Service Worker - clears stale cache
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => {
  self.clients.claim();
  self.registration.unregister().then(() => {
    console.log('[SW] Old service worker unregistered, reloading...');
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.navigate(client.url));
    });
  });
});
