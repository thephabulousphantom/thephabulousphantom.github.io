var CACHE_NAME = "njuskalo-cache-v1.3.1";
var urlsToCache = [
    "/",
    "/fonts/Bangers/Bangers-Regular.ttf",
    "/fonts/PatrickHand/PatrickHand-Regular.ttf",
    "/gfx/njuskalo-tiles.png",
    "/icons/njuskalo-icon.png",
    "/icons/njuskalo-icon-192.png",
    "/icons/njuskalo-icon-144.png",
    "/icons/njuskalo-icon-114.png",
    "/icons/njuskalo-icon-72.png",
    "/icons/njuskalo-icon-57.png",
    "/icons/njuskalo-icon-32.png",
    "/lib/handlebars/handlebars-intl.min.js",
    "/lib/handlebars/handlebars.min-v4.0.12.js",
    "/lib/jquery/jquery-3.3.1.min.js",
    "/lib/material-design-icons/material-icons.css",
    "/lib/material-design-icons/MaterialIcons-Regular.woff2",
    "/lib/mdl/material.min.js",
    "/lib/mdl/material.min.css",
    "/templates/game.js",
    "/templates/manual.js",
    "/templates/splash.js",
    "/templates/game.css",
    "/templates/manual.css",
    "/templates/splash.css",
    "/templates/game.handlebars",
    "/templates/manual.handlebars",
    "/templates/splash.handlebars",
    "/index.html",
    "/njuskalo-gfx-control.js",
    "/njuskalo-gfx-screen.js",
    "/njuskalo-gfx.js",
    "/njuskalo-keyboard.js",
    "/njuskalo-log.js",
    "/njuskalo-pointer.js",
    "/njuskalo-strings.js",
    "/njuskalo-utility.js",
    "/njuskalo.js",
    "/polyfills.js",
    "/njuskalo.css",
    "/njuskalo-service-worker.js"
];

self.addEventListener("install", function(event) {

    // Perform install steps
    event.waitUntil( caches.open(CACHE_NAME).then(
        
        function(cache) {
            
            console.log("Opened cache");
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", function(event) {
    
    event.respondWith( caches.match(event.request).then(
        
        function(response) {

            // Cache hit - return response
            if (response) {
                
                return response;
            }

            return fetch(event.request);
        }
    ));
});