const Joke = "funny-V2";
const assets = [
    "./",
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
    "./lib/screenshot/screenshot.js",
    "./lib/screenshot/default.mp3",
    "./lib/materialize/css/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2",
    "./img/apple-touch-icon.png",
    "./img/favicon.ico",
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(Joke)
            .then(function (cache) {
                return cache.addAll(assets);
            })
    );
});

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

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (key, i) {
                if (key !== Joke) {
                    return caches.delete(keys[i]);
                }
            }))
        })
    )
});

function requestBackend(event) {
    var url = event.request.clone();
    return fetch(url).then(function (res) {
        //if not a valid response send the error
        if (!res || res.status !== 200 || res.type !== 'basic') {
            return res;
        }

        var response = res.clone();

        caches.open(Joke).then(function (cache) {
            cache.put(event.request, response);
        });

        return res;
    })
}
