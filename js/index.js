const app = new Vue({
    el: '#app',
    data: {
        jokesList: [],
        jokesCount: 1,
        jokesLimit: 10,
        jokesCurrent: JSON.parse(localStorage.getItem('joke')),
        colors: ['#d32f2f ', '#ba68c8', '#3d5afe', '#00796b', '#03a9f4', '#9e9d24 ', '#5d4037'],
        url: 'https://v2.jokeapi.dev/joke/Pun?amount=10'
    },
    methods: {
        getJokes: function () {
            let url = this.url;
            $.get(url, data => {
                if (data.error) return alert("an error occured getting more jokes");
                this.setCount();
                this.jokesList = data.jokes;
            })
        },
        nextJoke: function () {
            if (this.jokesCount >= this.jokesLimit - 1) {
                setCount();
                this.getJokes();
                return
            }
            this.jokesCount = this.jokesCount + 1;
        },
        setCount(c = 1) {
            this.jokesCount = c;
        },
        changeColor: function (id = Math.floor(Math.random() * 6) + 1) {
            document.documentElement.style.setProperty('--main', this.colors[id]);
            document.querySelector('meta[name="theme-color"]').setAttribute('content', this.colors[id])
            document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]').setAttribute('content', this.colors[id])
        }
    },
    watch: {
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
