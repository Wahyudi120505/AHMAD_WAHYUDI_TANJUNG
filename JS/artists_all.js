import { getAccessToken } from '../JS/config.js'; // Mengimpor fungsi getAccessToken dari file config.js untuk mendapatkan token akses dari Spotify API

// Fungsi asinkron untuk mendapatkan informasi artis berdasarkan ID artis
async function getArtistInfo(artistId, accessToken) {
    // Melakukan permintaan HTTP GET ke API Spotify untuk mendapatkan informasi artis
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
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
    // Mengembalikan data artis
    return data;
}

// Fungsi asinkron untuk mendapatkan semua artis dari album baru
async function getAllNewReleaseArtists(accessToken) {
    // Melakukan permintaan HTTP GET ke API Spotify untuk mendapatkan album baru
    const response = await fetch('https://api.spotify.com/v1/browse/new-releases', {
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
    // Mengembalikan daftar ID artis dari semua album baru
    return data.albums.items.reduce((artists, album) => {
        // Menambahkan ID artis dari setiap album ke dalam array artists
        album.artists.forEach(artist => {
            artists.push(artist.id);
        });
        return artists;
    }, []);
}

// Fungsi asinkron untuk menampilkan semua artis di halaman artists_all.html
async function displayAllArtists() {
    try {
        // Mendapatkan token akses dengan memanggil fungsi getAccessToken
        const accessToken = await getAccessToken();
        // Mendapatkan daftar ID artis dari album baru menggunakan token akses
        const artistIds = await getAllNewReleaseArtists(accessToken);

        // Mengambil elemen div dengan id 'all-artists' untuk menampilkan daftar artis
        const artistListDiv = document.getElementById('all-artists');

        // Looping melalui setiap ID artis untuk menampilkan informasi artis
        for (const artistId of artistIds) {
            // Mendapatkan informasi artis dengan ID artis
            const artistInfo = await getArtistInfo(artistId, accessToken);

            // Membuat elemen figure untuk setiap artis
            const figure = document.createElement('figure');
            figure.classList.add('album-artist'); // Menambahkan kelas 'album-artist' untuk styling

            // Menambahkan gambar artis jika tersedia
            if (artistInfo.images.length > 0) {
                const artistImage = document.createElement('img');
                artistImage.src = artistInfo.images[0].url; // Mengambil gambar pertama dari data artis
                artistImage.alt = artistInfo.name; // Menambahkan teks alternatif dengan nama artis
                // Menambahkan event listener untuk klik pada gambar artis
                artistImage.addEventListener('click', () => {
                    localStorage.setItem('ArtistId', artistInfo.id); // Menyimpan ID artis di localStorage
                    window.location.href = '../HTML/detail_artists.html'; // Mengarahkan ke halaman detail_artists.html
                });
                figure.appendChild(artistImage); // Menambahkan gambar ke elemen figure
            } else {
                console.log('Gambar tidak ditemukan untuk artis:', artistInfo.name); // Menambahkan log jika tidak ada gambar
            }

            // Menambahkan nama artis
            const figcaption = document.createElement('figcaption');
            const artistName = document.createElement('strong'); // Membuat elemen strong untuk nama artis
            artistName.textContent = artistInfo.name; // Menetapkan teks nama artis
            figcaption.appendChild(artistName); // Menambahkan teks nama artis ke elemen figcaption
            figure.appendChild(figcaption); // Menambahkan elemen figcaption ke elemen figure

            // Menambahkan elemen artis ke dalam div all-artists
            artistListDiv.appendChild(figure);
        }
    } catch (error) {
        // Menangani error saat mendapatkan artis dari album baru
        console.error('Terjadi kesalahan saat mengambil artis:', error);
    }
}

// Memanggil fungsi displayAllArtists untuk menampilkan semua artis di halaman artists_all.html
displayAllArtists();
