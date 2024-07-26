import { getAccessToken } from '../JS/config.js';

let currentAudio = null; // Variabel untuk melacak audio yang sedang diputar
let currentPlayIcon = null; // Variabel untuk melacak ikon play/pause yang sedang aktif
let currentFigure = null; // Variabel untuk melacak elemen track yang sedang diputar

// Fungsi untuk mendapatkan rekomendasi lagu
async function getRecommendations(accessToken, seed_artists, seed_genres, seed_tracks) {
    // URL untuk mendapatkan rekomendasi dari API Spotify berdasarkan artis, genre, dan lagu
    const RECOMMENDATIONS_URL = `https://api.spotify.com/v1/recommendations?seed_artists=${seed_artists}&seed_genres=${seed_genres}&seed_tracks=${seed_tracks}`;
    
    // Melakukan fetch ke URL dengan header Authorization menggunakan token akses
    const response = await fetch(RECOMMENDATIONS_URL, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Error! Status: ${response.status}`);
    }

    // Mengambil data dari respons dalam bentuk JSON
    const data = await response.json();
    return data.tracks; // Mengembalikan data track dari hasil rekomendasi
}

// Fungsi untuk menampilkan rekomendasi
function displayRecommendations(tracks) {
    // Mengambil elemen kontainer untuk menampilkan rekomendasi
    const recommendationsContainer = document.getElementById('recommendations');
    recommendationsContainer.textContent = ''; // Kosongkan kontainer sebelum menambahkan rekomendasi baru

    // Looping melalui setiap track dalam rekomendasi
    tracks.forEach((track, index) => {
        // Hanya menampilkan lagu yang memiliki preview URL
        if (track.preview_url) {
            const figure = document.createElement('figure'); // Membuat elemen figure untuk track
            figure.className = 'track'; // Menambahkan kelas 'track' ke figure

            // Membuat elemen gambar untuk album art
            const albumArt = document.createElement('img');
            albumArt.className = 'album-art'; // Menambahkan kelas 'album-art' ke gambar
            albumArt.src = track.album.images[1].url; // Mengambil gambar dengan ukuran sedang

            const figcaption = document.createElement('figcaption'); // Membuat elemen figcaption untuk teks
            figcaption.className = 'captions'; // Menambahkan kelas 'captions' ke figcaption
            figure.appendChild(albumArt); // Menambahkan gambar ke elemen figure
            figure.appendChild(figcaption); // Menambahkan figcaption ke elemen figure

            // Membuat elemen p untuk judul
            const trackTitle = document.createElement('p');
            trackTitle.className = 'title'; // Menambahkan kelas 'title' ke elemen p
            trackTitle.textContent = track.name; // Menambahkan teks judul lagu
            figcaption.appendChild(trackTitle); // Menambahkan elemen p ke figcaption

            // Membuat elemen p untuk artis
            const trackArtists = document.createElement('p');
            trackArtists.className = 'artist-name'; // Menambahkan kelas 'artist' ke elemen p
            trackArtists.textContent = 'Artist: ' + track.artists.map(artist => artist.name).join(', ');
            figcaption.appendChild(trackArtists); // Menambahkan elemen p ke figcaption

            // Menambahkan ikon play/pause
            const playButton = document.createElement('a'); // Membuat elemen a untuk tombol play
            playButton.className = 'play-button'; // Menambahkan kelas 'play-button' ke elemen a
            const playIcon = document.createElement('i'); // Membuat elemen i untuk ikon
            playIcon.classList.add('bx', 'bx-play-circle'); // Menambahkan kelas ikon play
            playButton.appendChild(playIcon); // Menambahkan ikon ke tombol play

            let audio = new Audio(track.preview_url); // Membuat objek Audio untuk track

            // Event listener untuk klik pada track
            figure.addEventListener('click', () => {
                // Jika ada audio yang sedang diputar dan berbeda dengan yang diklik
                if (currentAudio && currentAudio !== audio) {
                    currentAudio.pause(); // Pause audio yang sedang diputar
                    currentPlayIcon.classList.replace('bx-pause-circle', 'bx-play-circle'); // Ganti ikon pause menjadi play
                    currentFigure.classList.remove('playing'); // Hapus kelas playing dari track sebelumnya
                }

                // Jika audio dalam keadaan paused, mainkan audio
                if (audio.paused) {
                    audio.play();
                    playIcon.classList.replace('bx-play-circle', 'bx-pause-circle'); // Ganti ikon play menjadi pause
                    currentAudio = audio; // Set audio yang sedang diputar saat ini
                    currentPlayIcon = playIcon; // Set ikon play/pause yang aktif saat ini
                    currentFigure = figure; // Simpan track yang sedang diputar
                    figure.classList.add('playing'); // Tambahkan kelas untuk menunjukkan sedang diputar
                } else {
                    audio.pause(); // Pause audio jika sedang diputar
                    playIcon.classList.replace('bx-pause-circle', 'bx-play-circle'); // Ganti ikon pause menjadi play
                    currentAudio = null; // Reset audio yang sedang diputar saat ini
                    currentPlayIcon = null; // Reset ikon play/pause yang aktif saat ini
                    figure.classList.remove('playing'); // Hapus kelas jika audio di pause
                }
            });

            // Event listener untuk ketika audio sedang diputar
            audio.addEventListener('play', () => {
                playIcon.classList.replace('bx-play-circle', 'bx-pause-circle'); // Ganti ikon play menjadi pause
                currentAudio = audio; // Set audio yang sedang diputar saat ini
                currentPlayIcon = playIcon; // Set ikon play/pause yang aktif saat ini
                figure.classList.add('playing'); // Tambahkan kelas untuk menunjukkan sedang diputar
            });

            // Event listener untuk ketika audio di pause
            audio.addEventListener('pause', () => {
                playIcon.classList.replace('bx-pause-circle', 'bx-play-circle'); // Ganti ikon pause menjadi play
                currentAudio = null; // Reset audio yang sedang diputar saat ini
                currentPlayIcon = null; // Reset ikon play/pause yang aktif saat ini
                figure.classList.remove('playing'); // Hapus kelas jika audio di pause
            });

            figure.appendChild(playButton); // Menambahkan tombol play ke elemen track
            recommendationsContainer.appendChild(figure); // Menambahkan elemen track ke kontainer rekomendasi
        }
    });
}

// Contoh penggunaan
getAccessToken().then(accessToken => { // Mendapatkan token akses
    getRecommendations(accessToken, '4NHQUGzhtTLFvgF5SZesLK', '', '').then(tracks => { // Mendapatkan rekomendasi lagu
        displayRecommendations(tracks); // Menampilkan rekomendasi
    }).catch(error => console.error('Terjadi kesalahan saat mengambil rekomendasi:', error)); // Menangani error saat mendapatkan rekomendasi
}).catch(error => console.error('Kesalahan saat mendapatkan token akses:', error)); // Menangani error saat mendapatkan token akses
