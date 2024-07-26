// Import fungsi getAccessToken dari file config.js untuk mendapatkan token akses Spotify
import { getAccessToken } from '../JS/config.js';
import { showPopup } from './popup.js'; // Mengimpor fungsi showPopup dari file popup.js untuk menampilkan notifikasi popup jika terjadi kesalahan

// Fungsi untuk mencari album berdasarkan keyword dan mengembalikan ID-nya
async function searchAlbum(keyword, accessToken) {
    const SEARCH_URL = `https://api.spotify.com/v1/search?q=${keyword}&type=album`;
    const response = await fetch(SEARCH_URL, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!response.ok) 
        throw new Error(`Error! Status: ${response.status}`);
    
    const data = await response.json();
    
    if (data.albums.items.length === 0) 
        throw new Error('No albums found.');
    
    return data.albums.items[0].id;
}

// Fungsi untuk mendapatkan detail album dan daftar lagunya menggunakan ID album
async function getAlbumData(albumId, accessToken) {
    const albumResponse = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!albumResponse.ok) 
        throw new Error(`Error! Status: ${albumResponse.status}`);
    
    const albumData = await albumResponse.json();
    
    return albumData;
}

// Fungsi untuk mengonversi durasi dari milidetik ke format menit:detik
function formatTime(duration) {
    let minutes = Math.floor(duration / 60000); 
    let seconds = Math.floor((duration % 60000) / 1000); 
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Fungsi untuk menampilkan detail album dan daftar lagunya
async function displayAlbumDetails() {
    try {
        const keyword = localStorage.getItem('keyword');
        if (!keyword) {
            console.error('Keyword tidak ditemukan di localStorage');
            return;
        }

        const accessToken = await getAccessToken();
        const albumId = await searchAlbum(keyword, accessToken);
        const album = await getAlbumData(albumId, accessToken);

        const albumDetailsDiv = document.getElementById('album-details');
        if (!albumDetailsDiv) {
            throw new Error('Elemen dengan ID "album-details" tidak ditemukan');
        }
        
        albumDetailsDiv.textContent = '';

        const figure = document.createElement('figure');
        figure.className = 'album-figure';

        if (album.images.length) {
            const albumImage = document.createElement('img');
            albumImage.src = album.images[0].url;
            albumImage.alt = album.name;
            albumImage.className = 'album-photo';
            figure.appendChild(albumImage);
        }

        const figcaption = document.createElement('figcaption');
        figcaption.className = 'album-figcaption';

        const albumTitle = document.createElement('h1');
        albumTitle.textContent = album.name;
        figcaption.appendChild(albumTitle);

        const albumArtists = document.createElement('p');
        albumArtists.className = 'album-artists';
        albumArtists.textContent = 'Artist: ' + album.artists.map(artist => artist.name).join(', ');
        figcaption.appendChild(albumArtists);

        const containerPlay = document.createElement('div');
        containerPlay.className = 'container-play';

        const prev = document.createElement('span');
        prev.className = 'material-symbols-outlined icon';
        prev.id = 'prev';
        prev.textContent = 'skip_previous';
        containerPlay.appendChild(prev);

        const playFigure = document.createElement('span');
        playFigure.className = 'material-symbols-outlined icon play-btn';
        playFigure.id = 'playFigure';
        playFigure.textContent = 'play_arrow';
        containerPlay.appendChild(playFigure);

        const next = document.createElement('span');
        next.className = 'material-symbols-outlined icon';
        next.id = 'next';
        next.textContent = 'skip_next';
        containerPlay.appendChild(next);

        const containerDuration = document.createElement('div');
        containerDuration.className = 'container-duration';

        const durationBackground = document.createElement('div');
        durationBackground.className = 'duration-background';
        containerDuration.appendChild(durationBackground);

        const durationBar = document.createElement('div');
        durationBar.className = 'duration-bar';
        containerDuration.appendChild(durationBar);

        containerPlay.appendChild(containerDuration);

        const duration = document.createElement('p');
        duration.className = 'duration';
        duration.textContent = '0:00';
        containerPlay.appendChild(duration);

        figcaption.appendChild(containerPlay);
        figure.appendChild(figcaption);
        albumDetailsDiv.appendChild(figure);

        const trackContainer = document.createElement('div');
        trackContainer.className = 'track-container';

        album.tracks.items.forEach((track, index) => {
            const trackDiv = document.createElement('div');
            trackDiv.className = 'track';

            const trackTitle = document.createElement('p');
            trackTitle.textContent = track.name;
            trackDiv.appendChild(trackTitle);

            const trackAudio = document.createElement('audio');
            trackAudio.src = track.preview_url;
            trackAudio.dataset.index = index;
            trackDiv.appendChild(trackAudio);

            trackContainer.appendChild(trackDiv);
        });

        albumDetailsDiv.appendChild(trackContainer);

        let currentAudio = null;
        let currentTrackIndex = -1;
        let durationBarUpdateInterval;

        function updatePlayPauseButton() {
            playFigure.textContent = currentAudio && !currentAudio.paused ? 'pause' : 'play_arrow';
        }

        function updateTrackTitleColor() {
            document.querySelectorAll('.track p').forEach((title, index) => {
                title.classList.toggle('playing', index === currentTrackIndex);
            });
        }

        function updateDurationBar() {
            if (currentAudio) {
                const durationMs = currentAudio.duration * 1000;
                const currentTimeMs = currentAudio.currentTime * 1000;
                const progress = (currentTimeMs / durationMs) * 100;
                durationBar.style.width = `${progress}%`;
                duration.textContent = formatTime(currentTimeMs);
            }
        }

        function stopDurationBarUpdate() {
            clearInterval(durationBarUpdateInterval);
        }

        function handleTrackChange(index) {
            if (currentAudio) {
                currentAudio.pause();
                stopDurationBarUpdate();
            }
            currentTrackIndex = index;
            currentAudio = document.querySelector(`audio[data-index="${currentTrackIndex}"]`);
            if (currentAudio) {
                currentAudio.play().catch(error => {
                    showPopup('Musik tidak bisa diputar: '); // Menampilkan popup jika musik tidak bisa diputar
                });
                updatePlayPauseButton();
                updateTrackTitleColor();
                duration.textContent = formatTime(currentAudio.duration * 1000);
                durationBarUpdateInterval = setInterval(updateDurationBar, 100);
                currentAudio.addEventListener('ended', () => {
                    playFigure.textContent = 'play_arrow';
                    stopDurationBarUpdate();
                    duration.textContent = formatTime(0);
                });
            }
        }

        playFigure.addEventListener('click', () => {
            if (playFigure.textContent === 'play_arrow') {
                if (currentTrackIndex === -1) currentTrackIndex = 0;
                handleTrackChange(currentTrackIndex);
            } else {
                if (currentAudio && !currentAudio.paused) {
                    currentAudio.pause();
                    updatePlayPauseButton();
                    stopDurationBarUpdate();
                }
            }
        });

        prev.addEventListener('click', () => {
            if (currentTrackIndex > 0) {
                handleTrackChange(--currentTrackIndex);
            }
        });

        next.addEventListener('click', () => {
            if (currentTrackIndex < album.tracks.items.length - 1) {
                handleTrackChange(++currentTrackIndex);
            }
        });

        trackContainer.addEventListener('click', (event) => {
            if (event.target.tagName === 'P') {
                const index = Array.from(trackContainer.children).indexOf(event.target.parentElement);
                if (index !== -1) handleTrackChange(index);
            }
        });

    } catch (error) {
        console.error('Kesalahan saat menampilkan detail album:', error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const keyword = localStorage.getItem('keyword');
    if (keyword) {
        displayAlbumDetails();
    }
});

document.querySelector('.search').addEventListener('submit', function(event) {
    event.preventDefault();
    displayAlbumDetails();
});
