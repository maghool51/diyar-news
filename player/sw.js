// سرویس‌ورکر دیار پلیر — کش کردن پوسته‌ی برنامه برای بازکردن سریع‌تر و کار نیمه‌آفلاین
const CACHE_NAME = 'diyar-player-v16';
const APP_SHELL = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './icon-512-maskable.png',
    './icon-180.png',
    './icon-32.png',
    './logo.png'
];

self.addEventListener('install', function(event){
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache){
            return cache.addAll(APP_SHELL);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(event){
    event.waitUntil(
        caches.keys().then(function(keys){
            return Promise.all(
                keys.filter(function(key){ return key !== CACHE_NAME; })
                    .map(function(key){ return caches.delete(key); })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function(event){
    if(event.request.method !== 'GET') return;

    // استراتژی «اول اینترنت»: همیشه تازه‌ترین نسخه را از سرور می‌گیرد؛
    // فقط وقتی اینترنت در دسترس نباشد (آفلاین)، به کش قبلی برمی‌گردد.
    event.respondWith(
        fetch(event.request).then(function(response){
            if(response && response.status === 200 && response.type === 'basic'){
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, clone); });
            }
            return response;
        }).catch(function(){
            return caches.match(event.request);
        })
    );
});
