// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const gameVersion = "v1.4";
const PRECACHE = "WebXRTest-precache-" + gameVersion;
const LAZYLOAD = 'WebXRTest-lazyload-' + gameVersion;
const RUNTIME = 'WebXRTest-runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [

    // manifest
    "./browserconfig.xml",
    "./manifest.json",

    // app
    "./",
    "./index.html",
    "./world.css",
    "./js/main.js"
];

const LAZYLOAD_URLS = [

    // icons
    "./img/icon/safari-pinned-tab.svg",
    "./img/icon/favicon.ico",
    "./img/icon/apple-touch-icon.png",
    "./img/icon/favicon-16x16.png",
    "./img/icon/favicon-32x32.png",
    "./img/icon/android-chrome-maskable.png",
    "./img/icon/mstile-150x150.png",
    "./img/icon/android-chrome-192x192.png",
    "./img/icon/android-chrome-384x384.png",
    "./img/icon/android-chrome-512x512.png"
];

async function addAllBypassCache(cacheName, urls) {
  const cache = await caches.open(cacheName);
  const requests = urls.map((url) => new Request(url, {
    cache: 'reload',
  }));
  await cache.addAll(requests);
}

// The install handler takes care of precaching the resources we always need.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => {
        //cache.addAll(PRECACHE_URLS);
        const requests = PRECACHE_URLS.map((url) => new Request(url, {
          cache: 'reload',
        }));
        cache.addAll(requests);
      })
      .then(() => { return caches.open(LAZYLOAD).then(cache => {       
        //cache.addAll(LAZYLOAD_URLS);
        const requests = LAZYLOAD_URLS.map((url) => new Request(url, {
          cache: 'reload',
        }));
        cache.addAll(requests);
      }); })
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", event => {
  const currentCaches = [PRECACHE, LAZYLOAD, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

var regexDoNotCache = new RegExp("(/api/)|(/socket.io/)");

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener("fetch", event => {

  if (event.request.method !== 'GET') {

    return;
  }

  if (event.request.url.match(regexDoNotCache)) {

    return;
  }

  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {

          console.log(`Service Worker returning ${event.request.url} from a cache.`);
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {

            console.log(`Service Worker fetched ${event.request.url} and caching in the runtime cache.`);
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});