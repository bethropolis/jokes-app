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
// Fetching content using Service Worker
self.addEventListener('fetch', function (event) {
  let online = navigator.onLine
  if (!online) {
      event.respondWith(
          caches.match(event.request).then(function (res) {
              if (res) {
                  return res;
              }
              requestBackend(event);
          })
      )
  }
});
function requestBackend(event) {
  var url = event.request.clone();
  return fetch(url).then(function (res) {
      //if not a valid response send the error
      if (!res || res.status !== 200 || res.type !== 'basic') {
          return res;
      }

      var response = res.clone();

      caches.open(CACHE_VERSION).then(function (cache) {
          cache.put(event.request, response);
      });

      return res;
  })
}