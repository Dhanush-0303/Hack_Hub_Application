const CACHE_NAME = "hackhub-v2.0";
const urlsToCache = [
  "/",
  "/index.html",
  "/home.html",
  "/login.html",
  "/details.html",
  "/bookmart.html",
  "/notifications.html",
  "/about.html",
  "/admin.html",
  "/css/style.css",
  "/js/app.js",
  "/js/auth.js",
  "/js/details.js",
  "/js/bookmarks.js",
  "/js/notifications.js",
  "/js/admin.js",
  "/js/firebase.js",
  "/manifest.json"
];

// Install Event - Cache resources
self.addEventListener("install", (event) => {
  console.log("🚀 Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Caching app shell");
      return cache.addAll(urlsToCache).catch(err => {
        console.warn("⚠️ Some resources failed to cache:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener("activate", (event) => {
  console.log("♻️ Service Worker activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("🗑️ Removing old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached version if offline
        return caches.match(request).then((response) => {
          if (response) {
            return response;
          }
          // Return offline page for HTML requests
          if (request.headers.get("accept").includes("text/html")) {
            return caches.match("/index.html");
          }
        });
      })
  );
});

console.log("✅ Service Worker ready!");
