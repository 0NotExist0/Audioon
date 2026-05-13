const CACHE_NAME = 'hf-audio-app-v2'; // Versione aggiornata
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './logger.js',
    './manifest.json'
];

// Installazione infallibile
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS_TO_CACHE))
        .catch(err => console.error("Errore salvataggio cache:", err))
    );
});

// Intercettazione sicura
self.addEventListener('fetch', event => {
    // IMPORTANTE: Ignora TUTTE le chiamate API esterne, passale direttamente a internet.
    // Questo evita il blocco "Failed to fetch" causato dal Service Worker.
    if (!event.request.url.startsWith(self.location.origin)) {
        return; 
    }

    // Solo per i file locali dell'app (HTML, CSS, JS) usa la cache
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
