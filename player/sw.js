// سرویس‌ورکر دیار پلیر — کش کردن پوسته‌ی برنامه برای بازکردن سریع‌تر و کار نیمه‌آفلاین
const CACHE_NAME = 'diyar-player-v1';
const APP_SHELL = [
    './',
    './index.html',
    './manifest.json'
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

    event.respondWith(
        caches.match(event.request).then(function(cached){
            const fetchPromise = fetch(event.request).then(function(response){
                // فقط درخواست‌های موفق و از نوع basic (هم‌مبدأ) کش می‌شوند
                if(response && response.status === 200 && response.type === 'basic'){
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, clone); });
                }
                return response;
            }).catch(function(){ return cached; });

            return cached || fetchPromise;
        })
    );
});
