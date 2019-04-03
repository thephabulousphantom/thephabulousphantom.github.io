var CACHE_NAME = 'njuskalo-cache-v1.2';
var urlsToCache = [
    '/',
    '/njuskalo.css',
    '/lib/jquery/jquery-ui.min.css',
    '/polyfills.js',
    '/njuskalo-gfx-control.js',
    '/njuskalo-gfx-screen.js',
    '/njuskalo-gfx.js',
    '/njuskalo-keyboard.js',
    '/njuskalo-log.js',
    '/njuskalo-pointer.js',
    '/njuskalo-service-worker.js',
    '/njuskalo-strings.js',
    '/njuskalo-utility.js',
    '/njuskalo.js',
    '/lib/handlebars/handlebars-intl.min.js',
    '/lib/handlebars/handlebars.min-v4.0.12.js',
    '/lib/jquery/jquery-3.3.1.min.js',
    '/lib/jquery/jquery-ui.min.js',
    '/templates/splash.handlebars',
    '/templates/splash.css',
    '/templates/splash.js',
    '/templates/main.handlebars',
    '/templates/main.css',
    '/templates/main.js',
    '/index.html',
    '/gfx/njuskalo-tiles.png',
    '/icons/njuskalo-icon.png',
    '/icons/njuskalo-icon-192.png',
    '/icons/njuskalo-icon-144.png',
    '/icons/njuskalo-icon-114.png',
    '/icons/njuskalo-icon-72.png',
    '/icons/njuskalo-icon-57.png',
    '/icons/njuskalo-icon-32.png'];

self.addEventListener('install', function(event) {

    // Perform install steps
    event.waitUntil( caches.open(CACHE_NAME).then(
        
        function(cache) {
            
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
    
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