const app = new Vue({
    el: '#app',
    data: {       
        displayPop: JSON.parse(localStorage.getItem("pop")) || null,
        jokesLiked: JSON.parse(localStorage.getItem("like")) || [],
        likedSwitch: false,
        jokesList: [],
        jokesCount: 1,
        jokesLimit: 10,
        jokesCurrent: JSON.parse(localStorage.getItem('joke')),
        colors: ['#d32f2f ', '#ba68c8', '#3d5afe', '#00796b', '#03a9f4', '#9e9d24 ', '#5d4037'],
        url: 'https://v2.jokeapi.dev/joke/Any?amount=20'

    },
    methods: {
        getJokes: function () {
            let url = this.url;
            $.get(url, data => {
                if (data.error) return alert("an error occured getting more jokes");
                this.jokesList = data.jokes;
                this.jokesCurrent = this.jokesList[0];
            })
        },
        isLimit: function () {
            if (this.jokesCount >= this.jokesLimit - 1) return true;
            if (this.jokesCount <= 0) return true;
            return false;
        },
        reset: function () {
            if (this.likedSwitch) return
            this.getJokes();
            setCount();

        },
        nextJoke: function () {
            if (this.isLimit()) return
            this.jokesCount++;
        },
        setCount(c = 1) {
            this.jokesCount = c;
        },
        prevJoke: function () {
            if (this.jokesCount <= 0) return
            this.jokesCount = this.jokesCount - 1;
        },
        likeJoke: function () {
            if (this.likedSwitch) {
                this.jokesLiked.push(this.jokesCurrent);
                localStorage.setItem("like", JSON.stringify(this.jokesLiked));
                this.likedSwitch = false;
                return
            }
            this.jokesLiked.push(this.jokesCurrent);
            localStorage.setItem("like", JSON.stringify(this.jokesLiked));
            this.likedSwitch = true;
        },
        changeColor: function (id = Math.floor(Math.random() * 6) + 1) {
            document.documentElement.style.setProperty('--main', this.colors[id]);
            document.querySelector('meta[name="theme-color"]').setAttribute('content', this.colors[id])
            document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]').setAttribute('content', this.colors[id])
        },
        closePop: function () {
            this.displayPop = true;
            localStorage.setItem("pop", JSON.stringify(true))
        },
        parse(data) {
            return JSON.parse(data)
        },
        loadLiked: function (params) {
            this.likedSwitch = true;
            this.jokesList = this.jokesLiked;
        },
        loadJokes: function () {
            this.likedSwitch = false;
        },
        stringify(data) {
            return JSON.stringify(data)
        },
        store(key, data, type) {
            value = null;
            if (!type) value = this.stringify(data);
            if (type) {
                let a = this.jokesLiked.push(this.jokesCurrent);
                value = this.stringify(this.jokesLiked);
            }
            localStorage.setItem(key, value)
        }
    },
    watch: {
        likedSwitch: function (val) {
            if (val) {
                this.jokesList = this.jokesLiked;
            } else {
                this.jokesList = this.jokesList;
            }
        },
        jokesList: function (params) {
            setCount();
            this.jokesCurrent = this.jokesList[this.jokesCount];
        },
        jokesCount: function (params) {
            this.changeColor()
            this.jokesCurrent = this.jokesList[this.jokesCount];
        },
        jokesCurrent: function () {
            if (!this.jokesCurrent) return
            localStorage.setItem("joke", JSON.stringify(this.jokesCurrent));
        }
    },
    mounted() {
        this.getJokes();
        if (!this.displayPop) {
            setTimeout(function (params) {
                $("#cls1").text("click anywhere to close");
            }, 7000)
        }
    },
})
function setCount(params) {
    app.jokesCount = 1;
}
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('serviceWorker.js')
        .then(function (registration) {
            console.log('Registration successful, scope is:', registration.scope);
        })
        .catch(function (error) {
            console.log('Service worker registration failed, error:', error);
        });
}


swiper.add({
    onLeft() {
        app.nextJoke();
        console.log('You swiped left.');
    },
    onRight() {
        app.prevJoke();
        console.log('You swiped right.');
    },
    onUp() {
        app.likeJoke();
        console.log('You swiped up.');
    }
})


