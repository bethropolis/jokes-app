const app = new Vue({
    el: "#app",
    data: {
        displayPop: JSON.parse(localStorage.getItem("pop")) || null,
        jokesLiked: JSON.parse(localStorage.getItem("like")) || [],
        likedSwitch: false,
        notify: "",
        view: false,
        jokesList: [],
        jokesCount: 0,
        jokesLimit: 9,
        jokesCurrent: JSON.parse(localStorage.getItem("joke")) || [],
        colors: ["#d32f2f ", "#ba68c8", "#3d5afe", "#00796b", "#03a9f4", "#9e9d24 ", "#5d4037",],
        urlEnd: 'https://v2.jokeapi.dev/joke/',
        url: localStorage.getItem("url")||"https://v2.jokeapi.dev/joke/Any?amount=20",
        device: false,
    },
    methods: {
        getJokes: function () {
            if (this.likedSwitch) return;
            let url = this.url;
            $.get(url, (data) => {
                if (data.error) return alert("an error occured getting more jokes");
                this.jokesList = data.jokes;
                this.jokesCurrent = this.jokesList[0];
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
        nextJoke: function () {
            if (this.isLimit(true)) {
                this.reset();
                return true;
            }
            this.jokesCount++;
        },
        setCount: function (c = 0) {
            this.jokesCount = c;
        },
        prevJoke: function () {
            if (this.isLimit()) return;
            this.jokesCount = this.jokesCount - 1;
        },
        setFunc: function () {
            let inp = this.getOptions();
            this.updateUrl(inp);
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
            this.jokesLiked = this.jokesList;
            localStorage.setItem("like", JSON.stringify(this.jokesLiked));
            this.showNotification("Joke removed from liked");
            this.loadJokes();
        },
        // toggle pop
        likeJoke: function () {
            if (!this.likedSwitch) {
                if (this.jokesLiked) {
                    this.store("like", this.jokesCurrent, true);
                } else {
                    this.store("like", this.jokesCurrent, false);
                }
                this.showNotification("Joke Liked!");
                return;
            }
            this.showNotification("already liked");
        },
        changeColor: function (id = Math.floor(Math.random() * 6) + 1) {
            document.documentElement.style.setProperty("--main", this.colors[id]);
            document
                .querySelector('meta[name="theme-color"]')
                .setAttribute("content", this.colors[id]);
            document
                .querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
                .setAttribute("content", this.colors[id]);
        },
        //delete jokes from local storage
        closePop: function () {
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
                    url: "https://joke-app-vue.firebaseapp.com/",
                });
            }
        }, // update url + slug
        updateUrl: function (slug) {
            let url = this.urlEnd + slug+'?amount=20';
            this.url = url;
            localStorage.setItem("url", url);
            this.showNotification("url updated");
            this.togglePop();
            this.getJokes();
            },
        showNotification: function (txt) {
            this.notify = txt;
            document.querySelector(".notification").classList.add("show");
            setTimeout(() => {
                document.querySelector(".notification").classList.remove("show");
            }, 600);
        },
        hideNitification: function () {
            document.querySelector(".notification").classList.remove("show");
        },
        loadJokes: function () {
            this.reset();
            this.likedSwitch = false;
        },
        loadLiked: function () {
            if (this.jokesLiked.length == [])
                return this.showNotification("no jokes liked");
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
        isMobile: function () {
            return "ontouchstart" in window;
        },
        settings: function () {
            this.view = false;
            this.togglePop();
        },
        getOptions: function () {
            let s = $('input').val();
            let q = s.split(' ').join('');
            return q
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
    },
    watch: {
        likedSwitch: async function () {
            if (this.likedSwitch) {
                if (!this.jokesLiked) {
                    this.jokesLiked = [];
                    await this.showNotification("no liked jokes");
                    return;
                }
                this.jokesLimit = this.jokesLiked.length - 1;
                this.jokesCount = 0;
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
            if (!this.jokesCurrent && this.likedSwitch) return;
            localStorage.setItem("joke", JSON.stringify(this.jokesCurrent));
        },
    },
    mounted() {
        this.getJokes();
        if (!this.displayPop) {
            setTimeout(function (params) {
                $("#cls1").text("click anywhere to close");
            }, 7000);
        }
        this.device = this.isMobile();
        $('select').formSelect();
    },
});

function setCount(params) {
    app.jokesCount = 0;
}
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("serviceWorker.js")
        .then(function (registration) {
            console.log("Registration successful, scope is:", registration.scope);
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
        app.reset();
        app.changeColor();
    },
});

document.addEventListener("keydown", function (event) {
    if (event.keyCode == 37) {
        app.prevJoke();
    } else if (event.keyCode == 39) {
        app.nextJoke();
    } else if (event.keyCode == 38 || event.keyCode == 32) {
        app.likeJoke();
    } else if (event.keyCode == 13) {
        app.reset();
    } else if (event.keyCode == 87) {
        location.reload();
    } else if (event.keyCode == 67) {
        app.changeColor();
    } else if (event.keyCode == 46) {
        app.removeLiked();
    } else if (event.keyCode == 80) {
        app.togglePop();
    }
});
