const Joke = "funny"
const assets = [
  "./",
  "serviceWorker.js",
  "app.webmanifest",
  "index.html",
  "js/index.js",
  "css/style.css",
  "lib/",
  "lib/vue/vue.min.js",
  "lib/jquery/jquery.min.js",
  "lib/materialize/css/materialize.min.css"
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(Joke).then(cache => {
      cache.addAll(assets)
    })
  )
}) 

self.addEventListener('fetch', function(event) {
  event.respondWith(
      caches.match(event.request)
          .then(function(response) {
                  // Cache hit - return response
                  if (response) {
                      return response;
                  }
                  return fetch(event.request);
              }
          )
  );
});

self.addEventListener('activate', (event) => {
  // Specify allowed cache keys
  const cacheAllowList = Joke;

  // Get all the currently active `Cache` instances.
  event.waitUntil(caches.keys().then((keys) => {
    // Delete all caches that aren't in the allow list:
    return Promise.all(keys.map((key) => {
      if (!cacheAllowList.includes(key)) {
        return caches.delete(key);
      }
    }));
  }));
});