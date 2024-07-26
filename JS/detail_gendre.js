import { getAccessToken } from '../JS/config.js'; // Mengimpor fungsi getAccessToken dari file config.js
import { showPopup } from '../JS/popup.js'; // Mengimpor fungsi showPopup dari file popup.js

let currentAudio = null; // Variabel untuk melacak audio yang sedang diputar
let currentTrackIndex = null; // Variabel untuk melacak indeks lagu yang sedang diputar
let tracks = []; // Array untuk menyimpan daftar lagu

// Fungsi untuk mendapatkan lagu berdasarkan genre dari API Spotify
async function getGenreTracks(genre, accessToken) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/recommendations?limit=10&seed_genres=${encodeURIComponent(genre)}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}` // Menyertakan token akses dalam header permintaan
            }
        });

        if (!response.ok) {
            throw new Error(`Error! Status: ${response.status}`); // Menangani jika terjadi kesalahan pada respons API
        }

        const data = await response.json(); // Mengambil data lagu dalam format JSON
        return data.tracks; // Mengembalikan daftar lagu
    } catch (error) {
        console.error(error); // Menampilkan kesalahan jika terjadi
    }
}

// Fungsi untuk memperbarui informasi lagu yang sedang diputar
function updatePlayingInfo(track) {
    const playingImg = document.querySelector('.playing-img'); // Mengambil elemen gambar untuk lagu yang sedang diputar
    const playingTitle = document.getElementById('playing-title'); // Mengambil elemen judul lagu
    const playingArtist = document.getElementById('playing-artist'); // Mengambil elemen nama artis

    if (playingImg && playingTitle && playingArtist) {
        playingImg.src = track.album.images[0].url; // Menampilkan gambar album lagu
        playingTitle.textContent = track.name; // Menampilkan judul lagu
        playingArtist.textContent = track.artists.map(artist => artist.name).join(', '); // Menampilkan nama artis
    } else {
        console.error('Informasi lagu tidak ditemukan.'); // Menampilkan kesalahan jika elemen tidak ditemukan
    }
}

// Fungsi untuk memperbarui ikon tombol play/pause
function updatePlayButton(isPlaying) {
    const playBtnIcon = document.getElementById('play-btn'); // Mengambil elemen ikon play/pause
    if (playBtnIcon) {
        playBtnIcon.classList.toggle('bx-play', !isPlaying); // Mengubah kelas ikon berdasarkan status pemutaran
        playBtnIcon.classList.toggle('bx-pause', isPlaying);
    } else {
        console.error('Icon play/pause tidak ditemukan.'); // Menampilkan kesalahan jika elemen tidak ditemukan
    }
}

// Fungsi untuk memutar lagu berdasarkan indeks
function playTrack(trackIndex) {
    if (currentAudio) {
        currentAudio.pause(); // Menjeda audio yang sedang diputar
        updatePlayButton(false); // Memperbarui ikon play/pause
    }

    const track = tracks[trackIndex]; // Mendapatkan track berdasarkan indeks

    if (!track.preview_url) {
        showPopup('Lagu ini tidak dapat diputar.'); // Menampilkan popup jika URL preview tidak tersedia
        return;
    }

    const audio = new Audio(track.preview_url); // Membuat objek Audio baru dengan URL preview

    audio.play().then(() => {
        updatePlayingInfo(track); // Memperbarui informasi lagu yang sedang diputar
        updatePlayButton(true); // Memperbarui ikon play/pause

        currentAudio = audio; // Menyimpan objek Audio yang sedang diputar
        currentTrackIndex = trackIndex; // Menyimpan indeks track yang sedang diputar

        // Memperbarui bar kemajuan dan tampilan waktu setiap detik
        const progressBar = document.getElementById('progress');
        const currentTimeDisplay = document.getElementById('current-time');
        const durationDisplay = document.getElementById('duration');

        const updateProgress = () => {
            if (currentAudio) {
                const currentTime = currentAudio.currentTime; // Mendapatkan waktu saat ini dari audio
                const duration = currentAudio.duration; // Mendapatkan durasi audio
                progressBar.style.width = `${(currentTime / duration) * 100}%`; // Memperbarui lebar progress bar
                currentTimeDisplay.textContent = formatTime(currentTime); // Memperbarui tampilan waktu saat ini
                durationDisplay.textContent = formatTime(duration); // Memperbarui tampilan durasi
            }
        };

        audio.addEventListener('timeupdate', updateProgress); // Memperbarui kemajuan setiap kali waktu audio berubah

        audio.addEventListener('ended', () => {
            updatePlayButton(false); // Mengubah ikon play/pause saat lagu selesai
            currentAudio = null; // Mengatur objek Audio menjadi null
            progressBar.style.width = '0%'; // Mengatur lebar progress bar ke 0%
            currentTimeDisplay.textContent = '0:00'; // Mengatur waktu saat ini ke 0:00
        });
    }).catch(error => {
        console.error(error); // Menampilkan kesalahan jika terjadi saat memutar lagu
        showPopup('Lagu ini tidak dapat diputar.'); // Menampilkan popup jika gagal memutar lagu
    });
}

// Fungsi untuk memformat waktu dalam format menit:detik
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60); // Menghitung menit
    const secs = Math.floor(seconds % 60); // Menghitung detik
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; // Mengembalikan format waktu sebagai menit:detik
}

// Fungsi untuk mengatur event listener pada tombol kontrol
function setupControls() {
    const playBtn = document.getElementById('play-btn'); // Mengambil elemen tombol play/pause
    const prevBtn = document.getElementById('prev-btn'); // Mengambil elemen tombol sebelumnya
    const nextBtn = document.getElementById('next-btn'); // Mengambil elemen tombol berikutnya

    playBtn.addEventListener('click', () => {
        if (currentAudio) {
            if (currentAudio.paused) {
                currentAudio.play(); // Memutar audio jika sedang dijeda
                updatePlayButton(true); // Memperbarui ikon play/pause
            } else {
                currentAudio.pause(); // Menjeda audio jika sedang diputar
                updatePlayButton(false); // Memperbarui ikon play/pause
            }
        } else if (tracks.length > 0) {
            playTrack(currentTrackIndex !== null ? currentTrackIndex : 0); // Memutar track pertama jika belum ada track yang dipilih
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentTrackIndex !== null && currentTrackIndex > 0) {
            playTrack(currentTrackIndex - 1); // Memutar track sebelumnya
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
            playTrack(currentTrackIndex + 1); // Memutar track berikutnya
        }
    });
}

// Fungsi untuk menampilkan daftar lagu berdasarkan genre
async function displayGenreTracks() {
    try {
        const urlParams = new URLSearchParams(window.location.search); // Mengambil parameter URL
        const genre = urlParams.get('genre'); // Mendapatkan genre dari parameter URL

        if (!genre) {
            throw new Error('Genre tidak ada di URL'); // Menangani jika genre tidak ditemukan di URL
        }

        const accessToken = await getAccessToken(); // Mendapatkan token akses
        tracks = await getGenreTracks(genre, accessToken); // Mendapatkan daftar lagu berdasarkan genre

        const tracksList = document.getElementById('tracks-list'); // Mengambil elemen daftar lagu

        tracks.forEach((track, index) => {
            const trackElement = document.createElement('figure'); // Membuat elemen figure untuk track
            trackElement.className = 'track'; // Menambahkan kelas untuk styling

            if (track.album.images.length > 0) {
                const img = document.createElement('img'); // Membuat elemen gambar untuk album
                img.src = track.album.images[0].url; // Menetapkan URL gambar album
                img.className = 'album-image'; // Menambahkan kelas untuk styling gambar album
                trackElement.appendChild(img); // Menambahkan gambar ke elemen figure
            }

            const trackCaption = document.createElement('figcaption'); // Membuat elemen figcaption untuk caption track
            trackCaption.className = 'captions'; // Menambahkan kelas untuk styling caption
            const trackTitle = document.createElement('p'); // Membuat elemen paragraf untuk judul track
            trackTitle.className = 'title'; // Menambahkan kelas untuk styling judul
            trackTitle.textContent = track.name; // Menetapkan judul track
            const trackArtists = document.createElement('p'); // Membuat elemen paragraf untuk nama artis
            trackArtists.className = 'artist'; // Menambahkan kelas untuk styling nama artis
            trackArtists.textContent = track.artists.map(artist => artist.name).join(', '); // Menetapkan nama artis
            trackCaption.appendChild(trackTitle); // Menambahkan judul ke caption
            trackCaption.appendChild(trackArtists); // Menambahkan nama artis ke caption
            trackElement.appendChild(trackCaption); // Menambahkan caption ke elemen figure

            trackElement.addEventListener('click', () => {
                playTrack(index); // Memutar track saat elemen figure diklik
            });

            tracksList.appendChild(trackElement); // Menambahkan elemen figure ke daftar lagu
        });

        if (tracks.length > 0) {
            updatePlayingInfo(tracks[0]); // Memperbarui informasi lagu yang sedang diputar dengan track pertama
            currentTrackIndex = 0; // Menetapkan indeks track yang sedang diputar ke 0
        } else {
            console.error('Tidak ada lagu untuk ditampilkan.'); // Menampilkan kesalahan jika tidak ada lagu
        }

        setupControls(); // Mengatur kontrol pemutar
    } catch (error) {
        console.error('Kesalahan saat menampilkan detail artis:', error); // Menampilkan kesalahan jika terjadi saat menampilkan detail
    }
}

displayGenreTracks(); // Memanggil fungsi untuk menampilkan daftar lagu berdasarkan genre
