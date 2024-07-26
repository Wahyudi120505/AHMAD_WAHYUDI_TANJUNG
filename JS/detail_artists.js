import { getAccessToken } from '../JS/config.js'; // Mengimpor fungsi getAccessToken dari file config.js
import { showPopup } from '../JS/popup.js'; // Mengimpor fungsi showPopup dari file popup.js

// Fungsi untuk mendapatkan informasi artis dan lagu-lagu top artis
async function getArtistData(artistId, accessToken) {
    // Melakukan permintaan ke API Spotify untuk mendapatkan data artis
    const Response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` } // Menyertakan token akses dalam header permintaan
    });

    // Memeriksa apakah respons dari API tidak berhasil
    if (!Response.ok) throw new Error(`Error! Status: ${Response.status}`);

    // Mengambil data artis dalam format JSON
    const artistData = await Response.json();

    // Melakukan permintaan ke API Spotify untuk mendapatkan lagu-lagu top artis
    const tracksResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
        headers: { 'Authorization': `Bearer ${accessToken}` } // Menyertakan token akses dalam header permintaan
    });

    // Memeriksa apakah respons dari API tidak berhasil
    if (!tracksResponse.ok) throw new Error(`Error! Status: ${tracksResponse.status}`);

    // Mengambil data lagu dalam format JSON
    const tracksData = await tracksResponse.json();
    return { artist: artistData, tracks: tracksData.tracks }; // Mengembalikan data artis dan daftar lagu
}

// Fungsi untuk mengonversi durasi dari milidetik ke format menit:detik
function formatTime(duration) {
    let minutes = Math.floor(duration / 60000); // Menghitung menit
    let seconds = Math.floor((duration % 60000) / 1000); // Menghitung detik
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // Mengembalikan format waktu sebagai menit:detik
}

// Fungsi untuk menampilkan detail artis dan lagu-lagunya
async function displayArtistDetails() {
    try {
        // Mengambil ID artis dari localStorage
        const artistId = localStorage.getItem('ArtistId');
        if (!artistId) throw new Error('Artist ID tidak ditemukan di localStorage'); // Menghasilkan error jika ID artis tidak ditemukan

        // Mendapatkan token akses
        const accessToken = await getAccessToken();
        // Mendapatkan data artis dan lagu-lagu top artis
        const { artist, tracks } = await getArtistData(artistId, accessToken);

        // Mengambil elemen div yang akan menampilkan detail artis
        const artistDetailsDiv = document.getElementById('artist-details');
        artistDetailsDiv.textContent = ''; // Menghapus konten lama

        // Membuat elemen untuk detail artis
        const figure = document.createElement('figure');
        figure.className = 'artist-figure'; // Menambahkan kelas untuk styling

        if (artist.images.length) { // Memeriksa apakah artis memiliki gambar
            const artistImage = document.createElement('img');
            artistImage.src = artist.images[0].url; // Mengambil URL gambar artis
            artistImage.alt = artist.name; // Menambahkan teks alternatif dengan nama artis
            artistImage.className = 'artist-photo'; // Menambahkan kelas untuk styling gambar
            figure.appendChild(artistImage);
        }

        const figcaption = document.createElement('figcaption');
        const artistName = document.createElement('h1');
        artistName.textContent = artist.name; // Menambahkan nama artis
        figcaption.appendChild(artistName);

        const artistFollowers = document.createElement('p');
        artistFollowers.className = 'artist-followers'; // Menambahkan kelas untuk styling
        artistFollowers.textContent = `Followers: ${artist.followers.total.toLocaleString()}`; // Menampilkan jumlah pengikut dengan format lokal
        figcaption.appendChild(artistFollowers);

        // Membuat elemen kontrol pemutar
        const containerPlay = document.createElement('div');
        containerPlay.className = 'container-play'; // Menambahkan kelas untuk styling kontrol pemutar

        const prev = document.createElement('span');
        prev.className = 'material-symbols-outlined icon'; // Menggunakan ikon untuk tombol sebelumnya
        prev.id = 'prev';
        prev.textContent = 'skip_previous'; // Teks untuk tombol sebelumnya
        containerPlay.appendChild(prev);

        const playFigure = document.createElement('span');
        playFigure.className = 'material-symbols-outlined icon play-btn'; // Menggunakan ikon untuk tombol play
        playFigure.id = 'playFigure';
        playFigure.textContent = 'play_arrow'; // Teks untuk tombol play
        containerPlay.appendChild(playFigure);

        const next = document.createElement('span');
        next.className = 'material-symbols-outlined icon'; // Menggunakan ikon untuk tombol berikutnya
        next.id = 'next';
        next.textContent = 'skip_next'; // Teks untuk tombol berikutnya
        containerPlay.appendChild(next);

        const containerDuration = document.createElement('div');
        containerDuration.className = 'container-duration-Animation icon'; // Menambahkan kelas untuk styling durasi

        const durationBackground = document.createElement('div');
        durationBackground.className = 'duration-background'; // Menambahkan kelas untuk latar belakang durasi
        containerDuration.appendChild(durationBackground);

        const durationBar = document.createElement('div');
        durationBar.className = 'duration-bar'; // Menambahkan kelas untuk bar durasi
        containerDuration.appendChild(durationBar);

        containerPlay.appendChild(containerDuration);

        const duration = document.createElement('p');
        duration.className = 'duration icon'; // Menambahkan kelas untuk styling durasi
        duration.textContent = '0:00'; // Inisialisasi durasi awal
        containerPlay.appendChild(duration);

        figcaption.appendChild(containerPlay); // Menambahkan kontrol pemutar ke figcaption
        figure.appendChild(figcaption); // Menambahkan figcaption ke figure
        artistDetailsDiv.appendChild(figure); // Menambahkan figure ke elemen artistDetailsDiv

        // Membuat elemen untuk daftar lagu
        const trackContainer = document.createElement('div');
        trackContainer.className = 'track-container'; // Menambahkan kelas untuk styling kontainer lagu

        tracks.forEach((track, index) => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'track'; // Menambahkan kelas untuk styling elemen lagu

            const trackTitle = document.createElement('p');
            trackTitle.textContent = track.name; // Menambahkan judul lagu
            trackDiv.appendChild(trackTitle);

            const trackAudio = document.createElement('audio');
            trackAudio.src = track.preview_url || ''; // Mengatur src sebagai string kosong jika preview_url tidak ada
            trackAudio.dataset.index = index; // Menyimpan indeks lagu dalam dataset
            trackAudio.addEventListener('error', () => {
                showPopup('Ada lagu yang tidak bisa di putar.'); // Menampilkan popup jika terjadi error saat memutar lagu
            });
            trackDiv.appendChild(trackAudio);

            trackContainer.appendChild(trackDiv); // Menambahkan elemen lagu ke trackContainer
        });

        artistDetailsDiv.appendChild(trackContainer); // Menambahkan trackContainer ke elemen artistDetailsDiv

        // Variabel untuk audio dan kontrol pemutar
        let currentAudio = null; // Menyimpan objek Audio yang sedang diputar
        let currentTrackIndex = -1; // Menyimpan indeks lagu yang sedang diputar
        let durationBarUpdateInterval; // Interval untuk memperbarui bar durasi

        function updatePlayPauseButton() {
            // Memperbarui ikon play/pause berdasarkan status audio saat ini
            playFigure.textContent = currentAudio && !currentAudio.paused ? 'pause' : 'play_arrow';
        }

        function updateTrackTitleColor() {
            // Mengubah warna judul lagu yang sedang diputar
            document.querySelectorAll('.track p').forEach((title, index) => {
                title.classList.toggle('playing', index === currentTrackIndex);
            });
        }

        function updateDurationBar() {
            // Memperbarui bar durasi dan waktu saat ini
            if (currentAudio) {
                const durationMs = currentAudio.duration * 1000; // Durasi dalam milidetik
                const currentTimeMs = currentAudio.currentTime * 1000; // Waktu saat ini dalam milidetik
                const progress = (currentTimeMs / durationMs) * 100; // Menghitung kemajuan pemutaran
                durationBar.style.width = `${progress}%`;
                duration.textContent = formatTime(currentTimeMs); // Memperbarui teks durasi
            }
        }

        function stopDurationBarUpdate() {
            // Menghentikan interval untuk memperbarui bar durasi
            clearInterval(durationBarUpdateInterval);
        }

        function handleTrackChange(index) {
            // Mengubah track yang sedang diputar
            if (currentAudio) {
                currentAudio.pause(); // Menjeda audio yang sedang diputar
                stopDurationBarUpdate(); // Menghentikan pembaruan bar durasi
            }
            currentTrackIndex = index; // Memperbarui indeks track yang dipilih
            currentAudio = document.querySelector(`audio[data-index="${currentTrackIndex}"]`); // Mendapatkan elemen audio yang sesuai

            if (currentAudio && currentAudio.src) {
                currentAudio.play().catch(() => {
                    showPopup('Lagu ini tidak dapat diputar.'); // Menampilkan popup jika terjadi error saat memutar lagu
                    playFigure.textContent = 'play_arrow'; // Mengubah ikon play jika gagal memutar
                    stopDurationBarUpdate();
                    duration.textContent = formatTime(0); // Mengatur durasi ke 0
                });
                updatePlayPauseButton(); // Memperbarui ikon play/pause
                updateTrackTitleColor(); // Memperbarui warna judul track
                duration.textContent = formatTime(currentAudio.duration * 1000); // Menampilkan durasi track
                durationBarUpdateInterval = setInterval(updateDurationBar, 100); // Memperbarui bar durasi setiap 100ms
                currentAudio.addEventListener('ended', () => {
                    playFigure.textContent = 'play_arrow'; // Mengubah ikon play ketika track selesai
                    stopDurationBarUpdate(); // Menghentikan pembaruan bar durasi
                    duration.textContent = formatTime(0); // Mengatur durasi ke 0
                });
            } else {
                playFigure.textContent = 'play_arrow'; // Mengubah ikon play jika tidak ada audio
                stopDurationBarUpdate();
                duration.textContent = formatTime(0); // Mengatur durasi ke 0
            }
        }

        // Menambahkan event listener untuk tombol play/pause
        playFigure.addEventListener('click', () => {
            if (playFigure.textContent === 'play_arrow') {
                if (currentTrackIndex === -1) currentTrackIndex = 0; // Menyimpan track pertama jika belum ada track yang dipilih
                handleTrackChange(currentTrackIndex); // Mengubah track yang sedang diputar
            } else {
                if (currentAudio && !currentAudio.paused) {
                    currentAudio.pause(); // Menjeda audio yang sedang diputar
                    updatePlayPauseButton(); // Memperbarui ikon play/pause
                    stopDurationBarUpdate(); // Menghentikan pembaruan bar durasi
                }
            }
        });

        // Menambahkan event listener untuk tombol prev
        prev.addEventListener('click', () => {
            if (currentTrackIndex > 0) {
                handleTrackChange(--currentTrackIndex); // Mengubah track ke sebelumnya
            }
        });

        // Menambahkan event listener untuk tombol next
        next.addEventListener('click', () => {
            if (currentTrackIndex < tracks.length - 1) {
                handleTrackChange(++currentTrackIndex); // Mengubah track ke berikutnya
            }
        });

        // Menambahkan event listener untuk klik pada daftar lagu
        trackContainer.addEventListener('click', (event) => {
            if (event.target.tagName === 'P') {
                const index = Array.from(trackContainer.children).indexOf(event.target.parentElement); // Mendapatkan indeks track yang diklik
                if (index !== -1) handleTrackChange(index); // Mengubah track yang sedang diputar
            }
        });

    } catch (error) {
        console.error('Kesalahan saat menampilkan detail artis:', error); // Menampilkan error jika terjadi kesalahan
    }
}

// Panggil fungsi displayArtistDetails untuk menampilkan informasi artis dan lagunya
displayArtistDetails();
