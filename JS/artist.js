import { getAccessToken } from '../JS/config.js'; // Mengimpor fungsi getAccessToken dari file config.js untuk mendapatkan token akses dari Spotify API

// Fungsi asinkron untuk mendapatkan informasi artis berdasarkan ID
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

// Fungsi asinkron untuk mendapatkan album baru dari Spotify
async function getNewReleaseArtists(accessToken) {
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
    console.log('Data Artis:', data); // Menampilkan data untuk debugging
    // Mengembalikan daftar album dari data yang diterima
    return data.albums.items; 
}

// Fungsi asinkron untuk menampilkan artis dari album baru di halaman web
async function displayNewReleaseArtists() {
    try {
        // Mendapatkan token akses dengan memanggil fungsi getAccessToken
        const accessToken = await getAccessToken(); 
        // Mendapatkan daftar album baru menggunakan token akses
        const albums = await getNewReleaseArtists(accessToken); 
        // Mengambil elemen div dengan id 'artist-list' untuk menampilkan daftar artis
        const artistListDiv = document.getElementById('artist-list'); 
        // Menampilkan hanya 5 artis dari daftar album
        const artistsToShow = albums.slice(0, 5); 

        // Looping melalui setiap album untuk menampilkan informasi artis
        for (const album of artistsToShow) { 
            const artist = album.artists[0]; // Mengambil artis pertama dari data album
            // Mendapatkan informasi artis dengan ID artis
            const artistInfo = await getArtistInfo(artist.id, accessToken); 

            // Membuat elemen figure untuk setiap artis
            const artistElement = document.createElement('figure');
            artistElement.classList.add('artist'); // Menambahkan kelas 'artist' untuk styling

            // Menambahkan gambar artis jika tersedia
            if (artistInfo.images && artistInfo.images.length > 0) {
                const artistImage = document.createElement('img');
                artistImage.src = artistInfo.images[0].url; // Mengambil gambar pertama dari data artis
                artistImage.alt = artist.name; // Menambahkan teks alternatif dengan nama artis
                artistImage.addEventListener('click', () => { // Menambahkan event listener untuk klik pada gambar
                    localStorage.setItem('ArtistId', artist.id); // Menyimpan ID artis di localStorage
                    window.location.href = '../HTML/detail_artists.html'; // Mengarahkan ke halaman detail_artists.html
                });
                artistElement.appendChild(artistImage); // Menambahkan gambar ke elemen figure
            } else {
                console.log('Gambar tidak ditemukan untuk artis:', artist.name); // Menambahkan log jika tidak ada gambar
            }

            // Menambahkan nama artis
            const artistName = document.createElement('figcaption');
            const artistNameText = document.createElement('strong'); // Membuat elemen strong untuk nama artis
            artistNameText.textContent = artist.name; // Menetapkan teks nama artis
            artistName.appendChild(artistNameText); // Menambahkan teks nama artis ke elemen figcaption
            artistElement.appendChild(artistName); // Menambahkan elemen figcaption ke elemen figure

            // Menambahkan elemen artis ke dalam div artist-list
            artistListDiv.appendChild(artistElement);
        }
    } catch (error) { // Menangani error saat mendapatkan artis dari album baru
        console.error('Terjadi kesalahan saat mengambil artis rilis baru:', error);
    }
}

// Memanggil fungsi displayNewReleaseArtists untuk menampilkan artis dari album baru di halaman web
displayNewReleaseArtists();

// Mengambil elemen tombol 'show-all-artists' untuk menampilkan semua artis
const showAllArtistsButton = document.getElementById('show-all-artists');
// Menambahkan event listener pada tombol 'show-all-artists'
showAllArtistsButton.addEventListener('click', () => {
    // Mengarahkan ke halaman artists_all.html saat tombol diklik
    window.location.href = '../HTML/artists_all.html'; 
});
