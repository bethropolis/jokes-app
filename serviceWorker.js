const Joke = "funny";
const assets = [
  "./index.html",
  "./serviceWorker.js",
  "./app.webmanifest",
  "./js/index.js",
  "./js/swipper.js",
  "./css/style.css",
  "./lib/vue/vue.min.js",
  "./lib/jquery/jquery.min.js",
  "./lib/materialize/css/materialize.min.css",
  "./lib/materialize/js/materialize.min.js",
  "./lib/materialize/css/icon.css",
  "./lib/materialize/css/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2",
  "./img/apple-touch-icon.png",
  "./img/favicon.ico",
];

// Installing Service Worker
self.addEventListener("install", (e) => {
  //console.log("[Service Worker] Install");
  e.waitUntil(
    (async () => {
      const cache = await caches.open(Joke);
     // console.log("[Service Worker] Caching all: app shell and content");
      await cache.addAll(assets);
    })()
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === Joke) {
            return;
          }
          return caches.delete(key);
        })
      );
    })
  );
});
//Fetching content using Service Worker
self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      const r = await caches.match(e.request);
      // console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (r) {
        return r;
      }
      const response = await fetch(e.request);
      // const cache = await caches.open(assets);
      // console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      //cache.put(e.request, response.clone());
      return response;
    })()
  );
});
