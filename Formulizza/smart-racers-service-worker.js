var CACHE_NAME = 'smart-racers-cache-v1.4';
var urlsToCache = [
    './',
    './smart-racers.css',
    './lib/jquery/jquery-ui.min.css',
    './templates/controller.css',
    './templates/game.css',
    './templates/menu.css',
    './templates/splash.css',
    './templates/controller.handlebars',
    './templates/game.handlebars',
    './templates/menu.handlebars',
    './templates/splash.handlebars',
    './polyfills.js',
    './smart-racers-gfx-control.js',
    './smart-racers-gfx-screen.js',
    './smart-racers-gfx.js',
    './smart-racers-keyboard.js',
    './smart-racers-log.js',
    './smart-racers-player.js',
    './smart-racers-pointer.js',
    './smart-racers-questions.js',
    './smart-racers-service-worker.js',
    './smart-racers-strings.js',
    './smart-racers-utility.js',
    './smart-racers.js',
    './lib/handlebars/handlebars-intl.min.js',
    './lib/handlebars/handlebars.min-v4.0.12.js',
    './lib/jquery/jquery-3.3.1.min.js',
    './lib/jquery/jquery-ui.min.js',
    './templates/controller.js',
    './templates/game.js',
    './templates/menu.js',
    './templates/splash.js',
    './index.html',
    './gfx/smart-racers-tiles.png',
    './icons/smart-racers-icon.png',
    './icons/smart-racers-icon-192.png',
    './icons/smart-racers-icon-144.png',
    './icons/smart-racers-icon-114.png',
    './icons/smart-racers-icon-72.png',
    './icons/smart-racers-icon-57.png',
    './icons/smart-racers-icon-32.png',
    './lib/jquery/images/ui-bg_flat_0_aaaaaa_40x100.png',
    './lib/jquery/images/ui-icons_444444_256x240.png',
    './lib/jquery/images/ui-icons_555555_256x240.png',
    './lib/jquery/images/ui-icons_777620_256x240.png',
    './lib/jquery/images/ui-icons_777777_256x240.png',
    './lib/jquery/images/ui-icons_cc0000_256x240.png',
    './lib/jquery/images/ui-icons_ffffff_256x240.png'];

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