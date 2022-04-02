const app = new Vue({
    el: "#app",
    data: {
        displayPop: JSON.parse(localStorage.getItem("pop")) || null,
        jokesLiked: [],
        likedSwitch: false,
        notify: "",
        colorTheme: JSON.parse(localStorage.getItem("colorTheme")) || false,
        view: true,
        jokesList: JSON.parse(localStorage.getItem("jokes")) || [],
        jokesCount: 0,
        jokesLimit: 9,
        jokesCurrent: JSON.parse(localStorage.getItem("joke")) || [],
        colors: [
            "#c0392b",
            "#1B1464",
            "#3d5afe",
            "#006266",
            "#03a9f4",
            "#9e9d24 ",
            "#cd6133",
            "#c2185b",
            "#5d4037",
        ],
        urlEnd: "https://v2.jokeapi.dev/joke/",
        url: "https://v2.jokeapi.dev/joke/Miscellaneous,Pun?blacklistFlags=nsfw,racist,explicit&amount=10",
        device: true,
    },
    methods: {
        getJokes: async function () {
            if (this.likedSwitch) return;
            if (!this.isOnline()) {
                this.jokesList = this.localJokes();
                this.showNotification("you are viewing offline jokes");
                return;
            }
            let url = this.url;
            await $.get(url, (data) => {
                if (data.error) return alert("an error occured getting more jokes");
                if (this.likedSwitch) return;
                this.jokesList = data.jokes;
                this.store("jokes", data.jokes, true);
                //this.jokesCurrent = this.jokesList[0];
            });
        },
        isLimit: function (cancel = false) {
            if (this.jokesCount >= this.jokesLimit) return true;
            if (this.jokesCount <= 0 && !cancel) return true;
            return false;
        },
        reset: function () {
            if (this.likedSwitch) return true;
            this.getJokes();
            setCount();
            return true;
        },
        nextJoke: async function () {
            if (this.isLimit(true)) {
                await setCount();
                await this.reset();
                return true;
            }
            this.jokesCount++;
        },
        setCount: function (c = 0) {
            this.jokesCount = c;
        },
        prevJoke: async function () {
            if (this.isLimit()) {
                await this.reset();
                return true;
            }
            this.jokesCount = this.jokesCount - 1;
        },
        removeLiked: function () {
            if (!this.likedSwitch)
                return this.showNotification("You haven't saved this joke");
            let i = this.jokesCount - 1;
            let index = this.jokesList.indexOf(this.jokesCount);
            if (this.jokesList.length - 2 < 0)
                return (
                    this.showNotification("You have no liked jokes"),
                    (this.likedSwitch = false)
                );
            this.jokesCount = i;
            this.jokesCurrent = this.jokesList[this.jokesCount];
            this.jokesList.splice(index, 1);
            //this.jokesLiked = this.jokesList;
            localStorage.setItem("like", JSON.stringify(this.jokesList));
            this.showNotification("Joke removed from liked");
            this.loadJokes();
        },
        // toggle pop
        likeJoke: function () {
            // do not store joke match an item in jokesLiked.id
            if (this.jokesLiked.includes(this.jokesCurrent)) return this.showNotification("You already liked this joke");
            if (!this.likedSwitch) {
                if (this.jokesLiked) {
                    this.store("like", this.jokesCurrent, true);
                } else {
                    this.store("like", this.jokesCurrent, false);
                }
                this.showNotification("Joke Liked!");
                return;
            }
            this.removeLiked()
        },
        setColor: function (id) {
            document.documentElement.style.setProperty("--main", id);
            document
                .querySelector('meta[name="theme-color"]')
                .setAttribute("content", id);
            document
                .querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
                .setAttribute("content", id);
        },
        changeColor: function (id = Math.floor(Math.random() * 8)+1) {
            if (this.colorTheme) return;
            this.setColor(this.colors[id]);
        },
        darkMode: function (cl) {
            let color = '#1e272e';
            this.colorTheme = color;
            this.store("colorTheme", color, false);
        },
        colorMode: function () {
            this.colorTheme = false;
            this.changeColor();
        },
        customColor: function () {
            this.colorTheme = $("#colorPick").val();
            this.store("colorTheme", this.colorTheme, false);
        },
        //delete jokes from local storage
        closePop: function () {
            if (this.getUrl()) this.toggleView();
            this.displayPop = true;
            localStorage.setItem("pop", JSON.stringify(true));
        },
        deleteJoke: function () {
            this.jokesLiked = [];
            localStorage.setItem("like", JSON.stringify(this.jokesLiked));
            this.likedSwitch = false;
        },
        parse: function (data) {
            return JSON.parse(data);
        },
        share: function () {
            let j = $("#joke").text();
            let joke = j.trim();
            if ("share" in navigator) {
                navigator.share({
                    title: "Joke",
                    text: joke,
                    url: "https://jokes-to-like.vercel.app/",
                });
            }
        }, // update url + slug
        updateUrl: function (slug) {
            let url = this.urlEnd + slug + "?amount=20";
            this.url = url;
            localStorage.setItem("url", url);
            this.showNotification("url updated");
            this.getJokes();
        },
        showNotification: function (txt) {
            this.notify = txt;
            document.querySelector(".notification").classList.add("show");
            setTimeout(() => {
                document.querySelector(".notification").classList.remove("show");
            }, 600);
        },
        hideNotification: function () {
            document.querySelector(".notification").classList.remove("show");
        },
        loadJokes: function () {
            this.likedSwitch = false;
        },
        loadLiked: async function () {
            this.jokesLiked = JSON.parse(localStorage.getItem("like")) || [];
            if (!this.jokesLiked.length) {
                return this.showNotification("no jokes liked");
            }
            this.jokesCount = 0;
            this.likedSwitch = true;
        },
        stringify: function (data) {
            return JSON.stringify(data);
        },
        store: function (key, data, type) {
            value = null;
            if (!type) value = this.stringify(data);
            if (type) {
                let a = this.jokesLiked.push(this.jokesCurrent);
                value = this.stringify(this.jokesLiked);
            }
            localStorage.setItem(key, value);
        },
        clear: function () {
            let x = confirm(`Are you sure you want to clear all offline jokes? (${this.localStorageSize()}kb)`);
            if (x) {
                localStorage.clear();
                this.showNotification("data cleared");
                window.location.reload();
            }

            this.togglePop();
        },
        isMobile: function () {
            return "ontouchstart" in window;
        },
        // is user online
        isOnline: function () {
            return navigator.onLine;
        },
        settings: function () {
            this.view = false;
            this.togglePop();
        },
        // toggle view and call display pop
        toggleView: function () {
            this.view = !this.view;
            this.togglePop();
        },
        togglePop: function () {
            this.displayPop = !this.displayPop;
            localStorage.setItem("pop", JSON.stringify(this.displayPop));
        },
        toggleLiked: function () {
            if (this.likedSwitch) {
                this.loadJokes();
                return;
            }
            this.loadLiked();
        },
        getUrl: function () {
            if (localStorage.getItem("url")) {
                let url = localStorage.getItem("url");
                let regex =
                    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
                if (regex.test(url)) {
                    this.url = url;
                } else {
                    this.url = "https://v2.jokeapi.dev/joke/All?amount=20";
                    return true
                }
            }
        },
        screenshot: function () {
            new Screenshot({
                success: img => {
                    console.log(img);
                }, sound: true
            });
        },
        localJokes: function () {
            return JSON.parse(localStorage.getItem("jokes"));
        },
        localStorageSize: function () {
            let _lsTotal = 0, _xLen, _x;
            for (_x in localStorage) {
                if (!localStorage.hasOwnProperty(_x)) continue;
                _xLen = (localStorage[_x].length + _x.length) * 2;
                _lsTotal += _xLen;
            }
            _t = (_lsTotal / 1024).toFixed(2);
            return _t;
        },
    },
    watch: {
        likedSwitch: async function () {
            if (this.likedSwitch) {
                if (!this.jokesLiked.length) {
                    this.jokesLiked = [];
                    await this.showNotification("no liked jokes");
                    return;
                }
                this.jokesLimit = this.jokesLiked.length - 1;
                await setCount();
                this.jokesList = this.jokesLiked;
                return;
            }
            this.reset();
        },
        jokesList: function (params) {
            this.jokesLimit = this.jokesList.length - 1;
            this.jokesCurrent = this.jokesList[this.jokesCount];
        },
        jokesCount: function (params) {
            this.changeColor();
            this.jokesCurrent = this.jokesList[this.jokesCount];
        },
        jokesCurrent: function () {
            if (!this.jokesCurrent || this.likedSwitch) return;
            localStorage.setItem("joke", JSON.stringify(this.jokesCurrent));
        },
        colorTheme: function () {
            if (!this.colorTheme) return;
            this.setColor(this.colorTheme);
        },
        displayPop: function (params) {
            // if(localStorage.getItem('url')) return
            // this.view = false;
        }

    },
    mounted() {
        this.getJokes();
        this.getUrl();
        this.device = this.isMobile();
        if (this.colorTheme) this.setColor(this.colorTheme);
        $('.tooltipped').tooltip();
    },
});

function setCount(params) {
    app.jokesCount = 0;
}
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("serviceWorker.js")
        .then(function (registration) {
            //console.log("Registration successful, scope is:", registration.scope);
        })
        .catch(function (error) {
            console.log("Service worker registration failed, error:", error);
        });
}

swiper.add({
    onLeft() {
        app.nextJoke();
    },
    onRight() {
        app.prevJoke();
    },
    onUp() {
        app.likeJoke();
    },
    onDown() {
        app.view = true;
        app.togglePop();
    },
});

document.addEventListener("keydown", function (event) {
    if (event.keyCode == 37) {
        app.prevJoke();
    } else if (event.keyCode == 39) {
        app.nextJoke();
    } else if (event.keyCode == 38) {
        app.likeJoke();
    } else if (event.keyCode == 32) {
        app.screenshot();
    } else if (event.keyCode == 13) {
        app.reset();
    } else if (event.keyCode == 87) {
        location.reload();
    } else if (event.keyCode == 67) {
        app.changeColor();
    } else if (event.keyCode == 46) {
        app.removeLiked();
    } else if (event.keyCode == 80) {
        app.view = true;
        app.togglePop();
    } else if (event.keyCode == 40) {
        app.toggleLiked();
    }
});
// screenshot api to take screenshots of the current page
