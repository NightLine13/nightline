/* Nightline service worker: cache the app shell; HTML is network-first; other origins (Supabase, ESPN, CDNs) are never touched */
var CACHE = 'nightline-shell-v1';
var SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){ return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   /* let the browser handle it */
  if (req.mode === 'navigate' || /\.html$|\/$/.test(url.pathname)){
    e.respondWith(fetch(req).then(function(res){ var copy = res.clone(); if (res.ok) caches.open(CACHE).then(function(c){ c.put('./index.html', copy); }); return res; })
      .catch(function(){ return caches.match('./index.html'); }));
    return;
  }
  e.respondWith(caches.match(req).then(function(hit){ return hit || fetch(req); }));
});
