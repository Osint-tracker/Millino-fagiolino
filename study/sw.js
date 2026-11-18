const CACHE='mirees-study-shell-4';
const files=['./','./index.html','./style.css','./app.mjs','./core.mjs','./store.mjs','./extras.mjs','./catalogue.mjs','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(files)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mirees-study-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
e.respondWith(caches.open(CACHE).then(async c=>await c.match(e.request)||fetch(e.request)))});
