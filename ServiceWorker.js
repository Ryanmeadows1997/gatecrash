// GateCrash service worker: network first, cache as an offline fallback.
// Online, every file comes fresh from the server, so new builds show up straight away.
// Offline, the last copies that loaded are used, so the game still opens.
const CACHE_NAME = "gatecrash-cache-v2";

self.addEventListener("install", (event) => {
  // Take over from any older service worker immediately.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
