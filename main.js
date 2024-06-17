/**
 * todo: 1. Render songs
 * todo: 2. Scroll top
 * todo: 3. Play /pause /seek
 * todo: 4. CD rotate
 * todo: 5. Next / prev
 * todo: 6. Random
 * todo: 7. Next / repeat when ended
 * todo: 8. Active song
 * todo: 9. Scroll active song into view
 * todo: 10. play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'NINH_PLAYER';

const player = $('.player');
const cd = $(".cd");
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const currentTimeElement = $('#current-time');
const totalTimeElement = $('#total-time');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    isActive: false,
    playedSongs: [],
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: "Gặp lại năm ta sáu mươi",
            singer: "Orange",
            path: "./assets/music/gapLaiNamTa60.mp3",
            image: "./assets/imgs/orange.jpg",
        },
        {
            name: "Cause i love you",
            singer: "Noo Phước Thịnh",
            path: "./assets/music/causeILoveYou.mp3",
            image: "./assets/imgs/noo.jpg",
        },
        {
            name: "Day by day",
            singer: "T-ara",
            path: "./assets/music/dayByDay.mp3",
            image: "./assets/imgs/tara.jpg",
        },
        {
            name: "Em của ngày hôm qua",
            singer: "Sơn Tùng MTP",
            path: "./assets/music/emCuaNgayHomQua.mp3",
            image: "./assets/imgs/sonTung.jpg",
        },
        {
            name: "Hãy ra khỏi người đó đi",
            singer: "Phan Mạnh Quỳnh",
            path: "./assets/music/hayRaKhoiNguoiDoDi.mp3",
            image: "./assets/imgs/phanManhQuynh.jpg",
        },
        {
            name: "Họ yêu ai mất rồi",
            singer: "Doãn Hiếu",
            path: "./assets/music/hoYeuAiMatRoi.mp3",
            image: "./assets/imgs/doanHieu.jpg",
        },
        {
            name: "Khóa ly biệt",
            singer: "Anh Tú",
            path: "./assets/music/khoaLyBiet.mp3",
            image: "./assets/imgs/anhTu.jpg",
        },
    ],
    setConfig: function(key,value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config));
    },

    // Render playlist
    render: function () {
        const htmls = this.songs.map((song, index) => `
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
        `);
        playlist.innerHTML = htmls.join('');
    },
    // Định nghĩa thuộc tính cho object
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        });
    },
    // Lắng nghe và xử lý các sự kiện dom events
    handleEvents: function () {
        const cdWidth = cd.offsetWidth;
        const _this = this;

        // Xử lý CD quay và dừng
        const cdThumbAnimate = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
            duration: 10000,
            iterations: Infinity
        });
        cdThumbAnimate.pause();

        // Xử lý phóng to/thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : '0';
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Xử lý click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        // Khi bài hát play
        audio.onplay = function () {
            _this.isPlaying = true;
            cdThumbAnimate.play();
            player.classList.add('playing');
            _this.setConfig('currentTime', audio.currentTime);
        };

        // Khi bài hát pause
        audio.onpause = function () {
            _this.isPlaying = false;
            _this.setConfig('currentTime', audio.currentTime);
            cdThumbAnimate.pause();
            player.classList.remove('playing');
        };

        // Tiến độ bài hát
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
                currentTimeElement.textContent = _this.formatTime(audio.currentTime);
                _this.setConfig('currentTime', audio.currentTime);
            }
        };

        // Xử lý khi tua bài hát  
        progress.oninput = function (event) {
            const seekTime = event.target.value * audio.duration / 100;
            audio.currentTime = seekTime;
            _this.setConfig('currentTime', audio.currentTime);
        };

        // Khi next song
        nextBtn.onclick = function (e) {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.scrollToActiveSong();
            _this.setConfig('currentIndex', _this.currentIndex);
        };

        // Khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.scrollToActiveSong();
            _this.setConfig('currentIndex', _this.currentIndex);
        };

        // Xử lý bật/tắt random
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        };

        // Xử lý next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        // Cập nhật tổng thời gian khi tải bài hát
        audio.onloadedmetadata = function () {
            totalTimeElement.textContent = _this.formatTime(audio.duration);
        };

        // Xử lý nút lặp lại
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        };
        // Xử lý click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            const option = e.target.closest('.option');
            if (songNode && !option) {
                //! Xử lý khi click vào song
                _this.currentIndex = Number(songNode.dataset.index);
                _this.setConfig('currentIndex', _this.currentIndex);
                _this.loadCurrentSong();
                _this.render();
                audio.play();
            }
        };
    },
    scrollToActiveSong:function(){
        setTimeout(()=> {
            if(this.currentIndex == 0 || this.currentIndex == 1 || this.currentIndex == 2){
                console.log('chính là nó')
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block:'center'
                });
            }else{
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block:'nearest'
                });
            }
        },200)
    },
    // Tải thông tin bài hát hiện tại lên UI
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        heading.classList.add('red');
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
        console.log("Đây là bài hát số: " + this.currentIndex);
    },

    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        this.currentIndex = this.config.currentIndex || 0;
        this.currentTime = this.config.currentTime || 0;
    },

    // Chuyển sang bài hát tiếp theo
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
        this.render();
    },
    // Chuyển về bài hát trước đó
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
        this.render();
    },
    // Phát ngẫu nhiên bài hát
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (this.playedSongs.includes(newIndex));
        this.playedSongs.push(newIndex);
        if (this.playedSongs.length === this.songs.length) {
            this.playedSongs = [];
        }
        this.currentIndex = newIndex;
        this.loadCurrentSong();
        this.render();
    },
    // Định dạng thời gian (phút:giây)
    formatTime: function (seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    },
    // Khởi động ứng dụng
    start: function(){
        //! Gán cấu hình từ config vào object
        this.loadConfig();
        console.log(this.isPlaying)

        //! Định nghĩa các thuộc tính cho object
        this.defineProperties();

        //! Lắng nghe và xử lý các sự kiện dom events
        this.handleEvents();

        //! Xử lý thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        //! Render lại play list
        this.render();

        //! Thiết lập lại trạng thái cho các nút điều khiển
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);

        //! Thiết lập lại trạng thái phát nhạc
        audio.currentTime = this.currentTime; // Đặt thời gian hiện tại trước khi phát
        // if (this.isPlaying) {
        //     audio.play();
        // }

    }
};

app.start();
