const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PLAYER_STORGE_KEY = 'F8 player'

const playlist = $('.playlist')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORGE_KEY, JSON.stringify(this.config))
    },
    songs: [
        {
            name: "Heat wave",
            singer: "Glass Animals",
            path: "./assets/music/Heat Waves - Glass Animals.mp3",
            image: "https://upload.wikimedia.org/wikipedia/en/b/b0/Glass_Animals_-_Heat_Waves.png"
        },
        {
            name: "Let her go",
            singer: "The Passengers",
            path: "./assets/music/Let Her Go - Passenger.mp3",
            image: "https://i.ytimg.com/vi/RBumgq5yVrA/maxresdefault.jpg"
        },
        {
            name: "Lost stars",
            singer: "Adam Levine",
            path: "./assets/music/Lost Stars - Adam Levine.mp3",
            image: "https://i.ytimg.com/vi/OWZcQcark6g/maxresdefault.jpg"
        },
        {
            name: "Lovely",
            singer: "Billie Eilish_ Khalid",
            path: "./assets/music/Lovely - Billie Eilish_ Khalid.mp3",
            image: "https://i.ytimg.com/vi/V1Pl8CzNzCw/maxresdefault.jpg"
        },
        {
            name: "Perfect",
            singer: "Ed Sheeran_ Beyonce",
            path: "./assets/music/Perfect Duet - Ed Sheeran_ Beyonce.mp3",
            image: "https://upload.wikimedia.org/wikipedia/vi/8/80/Ed_Sheeran_Perfect_Single_cover.jpg"
        },
        {
            name: "Save your tear",
            singer: "The Weeknd",
            path: "./assets/music/Save Your Tears - The Weeknd (NhacPro.net).mp3",
            image: "https://avatar-ex-swe.nixcdn.com/song/2021/04/23/2/f/5/3/1619153014739_640.jpg"
        },
        {
            name: "Somebody That I Used To Know",
            singer: "Gotye",
            path: "./assets/music/Somebody That I Used To Know - Gotye_ Ki.mp3",
            image: "https://static.ybox.vn/2017/10/21/8deb534a-b676-11e7-9c4b-cac091044fd5.jpg"
        },
        {
            name: "The Scientist",
            singer: "Holly Henry",
            path: "./assets/music/The-Scientist-The-Voice-US-2013-Holly-Henry.mp3",
            image: "https://i.ytimg.com/vi/RB-RcX5DS5A/maxresdefault.jpg"
        }
    ],
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')"></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    handleEvents: function() {
        const cdWidth = cd.offsetWidth
        const _this = this

        // handle rotate CD
        const cdThumbAnimate = cdThumb.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 15000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // solving scroll
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth 
        }

        // handle when click play
        playBtn.onclick  = function() {
            if(_this.isPlaying) {
                audio.pause()
            }
            else {
                audio.play()
            }
        }

        // when song played
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // when song not playing
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // progress of song change
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // handle when modify song
        progress.onchange = function(e) {
            const seekTime = e.target.value * audio.duration / 100
            audio.currentTime = seekTime
        }

        // when next click
        nextBtn.onclick = function() {
            if(_this.isRandom)
                _this.playRandom()
            else
                _this.nextSong()
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // when prev click
        prevBtn.onclick = function() {
            if(_this.isRandom)
                _this.playRandom()
            else
                _this.prevSong()
            audio.play()
            _this.render()
            _this.scrollToActiveSong()

        }

        // when click random
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            this.classList.toggle('active', _this.isRandom)
        }

        // handle when reapeat
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            this.classList.toggle('active', _this.isRepeat)
        }

        // handle when audio ended
        audio.onended = function() {
            if(_this.isRepeat)
                audio.play()
            else
                nextBtn.click()
        }

        // listen click into playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')) {
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                if(e.target.closest('.option')) {

                }
            }
        }
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    loadCurrentSong: function() {

        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRandom
    },
    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex > this.songs.length - 1)
            this.currentIndex = 0
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0)
            this.currentIndex = this.songs.length - 1
        this.loadCurrentSong()
    },
    playRandom: function() {
        let newIndex 
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        }while(newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 100)
    },
    start: function() {
        // assign config to app
        this.loadConfig()

        // define properties for object
        this.defineProperties()

        // listen and handle events
        this.handleEvents()

        // load current song to UI
        this.loadCurrentSong()

        // render playlist
        this.render()

        // show out
        repeatBtn.classList.toggle('active', this.isRepeat)
        randomBtn.classList.toggle('active', this.isRandom)
    }
}
app.start()