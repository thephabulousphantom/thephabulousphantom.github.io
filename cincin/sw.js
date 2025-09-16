const CACHE_NAME = "game-runtime-v1";

self.addEventListener("install", function onInstall(event) {
  // Online-first: do not precache. Activate immediately.
  self.skipWaiting();
});

self.addEventListener("activate", function onActivate(event) {
  event.waitUntil(onActivateAsync());
});

async function onActivateAsync() {
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map(deleteIfOutdated));
    await self.clients.claim();
  } catch (e) {
    // ignore activation errors
  }
}

async function deleteIfOutdated(key) {
  if (key !== CACHE_NAME) {
    await caches.delete(key);
  }
}

self.addEventListener("fetch", function onFetch(event) {
  event.respondWith(onFetchAsync(event));
});

async function onFetchAsync(event) {
  const req = event.request;
  if (req.method !== "GET") {
    return fetch(req);
  }

  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    return fetch(req);
  }

  try {
    const res = await fetch(req);
    try {
      const copy = res.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(req, copy);
    } catch (e) {
      // ignore cache write errors
    }
    return res;
  } catch (e) {
    const cached = await caches.match(req);
    return cached || Response.error();
  }
}
