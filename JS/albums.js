import { getAccessToken } from '../JS/config.js'; // Mengimpor fungsi getAccessToken dari file config.js untuk mendapatkan token akses dari Spotify API
import { showPopup } from '../JS/popup.js'; // Mengimpor fungsi showPopup dari file popup.js untuk menampilkan notifikasi popup jika terjadi kesalahan

// Fungsi asinkron untuk mendapatkan album pop teratas dari Spotify
async function getTopPopAlbums(accessToken) {
    // Melakukan permintaan HTTP GET ke Spotify API untuk mendapatkan rilis baru berdasarkan genre pop
    const response = await fetch('https://api.spotify.com/v1/browse/new-releases?genre=pop', {
        headers: {
            'Authorization': `Bearer ${accessToken}` // Menyertakan token akses dalam header permintaan sebagai Bearer token
        }
    });

    // Memeriksa apakah respons dari API berhasil (status HTTP 200-299)
    if (!response.ok) {
        // Jika status tidak ok, lemparkan error dengan pesan status
        throw new Error(`Error! Status: ${response.status}`);
    }

    // Mengambil data dari respons dalam bentuk JSON dan mengubahnya menjadi objek JavaScript
    const data = await response.json();
    // Mengembalikan daftar album dari data yang diterima
    return data.albums.items;
}

// Fungsi asinkron untuk mendapatkan daftar lagu dari album tertentu menggunakan albumId
async function getTracksFromAlbum(albumId, accessToken) {
    // Melakukan permintaan HTTP GET ke Spotify API untuk mendapatkan lagu-lagu dari album berdasarkan albumId
    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
        headers: {
            'Authorization': `Bearer ${accessToken}` // Menyertakan token akses dalam header permintaan sebagai Bearer token
        }
    });

    // Memeriksa apakah respons dari API berhasil (status HTTP 200-299)
    if (!response.ok) {
        // Jika status tidak ok, lemparkan error dengan pesan status
        throw new Error(`Error! Status: ${response.status}`);
    }

    // Mengambil data dari respons dalam bentuk JSON dan mengubahnya menjadi objek JavaScript
    const data = await response.json();
    // Mengembalikan daftar lagu dari data yang diterima
    return data.items;
}

// Fungsi asinkron untuk menampilkan album pop teratas di halaman
async function displayTopPopAlbums() {
    try {
        // Mendapatkan token akses dengan memanggil fungsi getAccessToken
        const accessToken = await getAccessToken();
        // Mendapatkan daftar album pop teratas menggunakan token akses
        const albums = await getTopPopAlbums(accessToken);

        // Mendapatkan elemen HTML dengan id 'albums-list' untuk menampilkan album
        const albumsListDiv = document.getElementById('albums-list');
        // Menampilkan hanya 5 album teratas dari daftar album
        const albumsToShow = albums.slice(0, 5);

        // Variabel untuk menyimpan audio yang sedang diputar saat ini
        let currentAudio = null;
        // Variabel untuk menyimpan album yang sedang diputar saat ini
        let currentPlayingAlbum = null;

        // Mengiterasi setiap album yang didapat dari API
        albumsToShow.forEach(album => {
            // Membuat elemen figure HTML untuk setiap album
            const albumElement = document.createElement('figure');
            albumElement.classList.add('album'); // Menambahkan kelas 'album' untuk styling

            if (album.images.length > 0) {
                // Jika album memiliki gambar, buat elemen img untuk foto album
                const albumImage = document.createElement('img');
                albumImage.src = album.images[0].url; // Mengatur URL gambar sebagai sumber gambar
                albumImage.alt = album.name; // Menambahkan teks alternatif gambar
                albumImage.width = 300; // Mengatur lebar gambar menjadi 300px
                albumImage.style.cursor = 'pointer'; // Menambahkan kursor pointer saat hover di atas gambar

                // Membuat elemen button untuk tombol play/pause
                const button = document.createElement('button');
                // Membuat elemen ikon play dan pause
                const playIcon = document.createElement('i');
                playIcon.className = 'bx bx-play-circle play-icon show'; // Ikon play yang akan ditampilkan
                const pauseIcon = document.createElement('i');
                pauseIcon.className = 'bx bx-pause-circle pause-icon'; // Ikon pause yang akan ditampilkan
                button.appendChild(playIcon); // Menambahkan ikon play ke tombol
                button.appendChild(pauseIcon); // Menambahkan ikon pause ke tombol

                // Fungsi asinkron untuk memutar musik ketika tombol diklik
                const playMusic = async () => {
                    // Mendapatkan daftar lagu dari album yang diklik
                    const tracks = await getTracksFromAlbum(album.id, accessToken);
                    // Mencari lagu pertama dengan preview_url (lagu yang dapat diputar)
                    const track = tracks.find(track => track.preview_url);
                    if (track) {
                        // Jika ada lagu yang ditemukan, hentikan audio yang sedang diputar sebelumnya
                        if (currentAudio) {
                            currentAudio.pause(); // Menghentikan pemutaran audio yang sedang aktif
                            if (currentPlayingAlbum) {
                                currentPlayingAlbum.classList.remove('playing'); // Menghapus status 'playing' dari album yang sedang diputar
                                const currentPlayIcon = currentPlayingAlbum.querySelector('.play-icon');
                                const currentPauseIcon = currentPlayingAlbum.querySelector('.pause-icon');
                                currentPlayIcon.classList.add('show'); // Menampilkan ikon play pada album yang sebelumnya diputar
                                currentPauseIcon.classList.remove('show'); // Menyembunyikan ikon pause pada album yang sebelumnya diputar
                            }
                        }
                        if (currentPlayingAlbum === albumElement) {
                            // Jika album yang sama diklik lagi, hentikan pemutaran
                            currentAudio = null;
                            currentPlayingAlbum = null;
                        } else {
                            // Memulai pemutaran lagu baru dari album yang diklik
                            currentAudio = new Audio(track.preview_url); // Membuat objek Audio dengan URL preview dari lagu
                            currentAudio.play(); // Memulai pemutaran audio
                            albumElement.classList.add('playing'); // Menandai album yang sedang diputar
                            playIcon.classList.remove('show'); // Menyembunyikan ikon play
                            pauseIcon.classList.add('show'); // Menampilkan ikon pause
                            currentAudio.onended = () => {
                                // Ketika pemutaran audio selesai
                                albumElement.classList.remove('playing'); // Menghapus status 'playing' dari album
                                playIcon.classList.add('show'); // Menampilkan ikon play
                                pauseIcon.classList.remove('show'); // Menyembunyikan ikon pause
                            };
                            currentPlayingAlbum = albumElement; // Menyimpan album yang sedang diputar saat ini
                        }
                    } else {
                        // Menampilkan popup jika tidak ada lagu yang dapat diputar
                        showPopup('Tidak ada lagu yang dapat diputar untuk album ini.');
                    }
                };

                // Menambahkan event listener untuk tombol play/pause
                button.addEventListener('click', playMusic);

                // Menambahkan gambar album dan tombol play/pause ke elemen album
                albumElement.appendChild(albumImage);
                albumElement.appendChild(button);
            }

            // Membuat elemen figcaption untuk menampilkan nama album dan nama artis
            const albumName = document.createElement('figcaption');
            const albumNameText = document.createElement('strong');
            albumNameText.textContent = album.name; // Mengatur nama album
            albumName.appendChild(albumNameText);

            // Menambahkan elemen <br> untuk pemisah antara nama album dan nama artis
            const br = document.createElement('br');
            albumName.appendChild(br);

            // Menambahkan nama artis
            const artistNameText = document.createTextNode(album.artists[0].name); // Nama artis dari album
            albumName.appendChild(artistNameText);

            // Menambahkan elemen figcaption ke elemen album
            albumElement.appendChild(albumName);
            // Menambahkan elemen album ke daftar album di halaman
            albumsListDiv.appendChild(albumElement);
        });

    } catch (error) {
        // Menangani dan menampilkan kesalahan jika terjadi selama proses
        console.error('Kesalahan saat mengambil album pop:', error);
    }
}

// Memanggil fungsi displayTopPopAlbums untuk menampilkan album pop teratas di halaman
displayTopPopAlbums();

// Menambahkan event listener pada tombol 'show-all-albums' untuk mengarahkan ke halaman 'albums_all.html' saat tombol diklik
const showAllArtistsButton = document.getElementById('show-all-albums');
showAllArtistsButton.addEventListener('click', () => {
    window.location.href = '../HTML/albums_all.html'; // Mengarahkan ke halaman albums_all.html
});
