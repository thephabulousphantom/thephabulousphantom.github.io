// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const gameVersion = "v1.8";
const PRECACHE = "astroPirouette-precache-" + gameVersion;
const LAZYLOAD = 'astroPirouette-lazyload-' + gameVersion;
const RUNTIME = 'astroPirouette-runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [

    // manifest
    "./browserconfig.xml",
    "./manifest.json",

    // web entry point
    "./index.html",
    "./game.css",

    // 3d
    "./3d/asteroid.glb",
    "./3d/rocket.glb",

    // fonts
    "./font/MaterialIcons-Regular.ttf",

    // grafix
    "./img/exhaust.png",
    "./img/explosion.png",
    "./img/fire.png",
    "./img/github-qr.png",
    "./img/logo.webp",
    "./img/orion-nebula-nasa.webp",

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
    "./img/icon/android-chrome-512x512.png",

    // js
    "./js/colors.js",
    "./js/factory.js",
    "./js/game.js",
    "./js/keyboard.js",
    "./js/log.js",
    "./js/screen.js",
    "./js/screenConfig.js",
    "./js/screenGameOver.js",
    "./js/screenLoading.js",
    "./js/screenMenu.js",
    "./js/screenPlay.js",
    "./js/sound.js",
    "./js/thing.js",
    "./js/thingAsteroids.js",
    "./js/thingBullets.js",
    "./js/thingExplosions.js",
    "./js/thingProtagonist.js",
    "./js/thingStarField.js",
    "./js/thingTrail.js",
    "./js/world.js",

    // third party libs
    "./js/lib/howler/howler.core.min.js",
    "./js/lib/sprite-mixer/sprite-mixer.js",
    "./js/lib/three/GLTFLoader.js",
    "./js/lib/three/three.min.js",
    "./js/lib/tween/tween.esm.js",

    // sounds
    "./sfx/engine.ogg",
    "./sfx/explosion.ogg",
    "./sfx/laser.ogg"
];

const LAZYLOAD_URLS = [

    // libraries
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => {
        var urlsToCache = [];
        for (var i = 0; i < PRECACHE_URLS.length; i++) {

          urlsToCache[i] = PRECACHE_URLS[i] + "?" + gameVersion;
        }
        cache.addAll(PRECACHEurlsToCache_URLS);
      })
      .then(() => { return caches.open(LAZYLOAD).then(cache => {
        
        var urlsToCache = [];
        for (var i = 0; i < LAZYLOAD_URLS.length; i++) {

          urlsToCache[i] = LAZYLOAD_URLS[i] + "?" + gameVersion;
        }
        cache.addAll(urlsToCache)
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
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
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