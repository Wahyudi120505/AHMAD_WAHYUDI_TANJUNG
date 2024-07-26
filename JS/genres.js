import { getAccessToken } from './config.js'; // Mengimpor fungsi getAccessToken dari file config.js

// Fungsi untuk mendapatkan genre yang tersedia dari API Spotify
async function getAvailableGenres(accessToken) {
    try {
        // Melakukan fetch ke URL API Spotify untuk mendapatkan genre yang tersedia
        const response = await fetch('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
            headers: {
                'Authorization': `Bearer ${accessToken}` // Menambahkan header Authorization dengan token akses
            }
        });

        // Jika respons tidak oke (status bukan 200), lempar error
        if (!response.ok) {
            throw new Error(`Error! Status: ${response.status}`);
        }

        // Mengambil data dari respons dalam bentuk JSON
        const data = await response.json();
        return data.genres; // Mengembalikan daftar genre
    } catch (error) {
        console.error('Terjadi kesalahan saat mengambil genre:', error); // Menangani error jika terjadi
        throw error; // Menghasilkan kembali error
    }
}

// Fungsi untuk menampilkan genre yang tersedia di halaman
async function displayAvailableGenres() {
    try {
        // Mendapatkan token akses
        const accessToken = await getAccessToken();
        
        // Mendapatkan genre yang tersedia
        const genres = await getAvailableGenres(accessToken);
        
        // Mengambil elemen div untuk menampilkan daftar genre
        const genresList = document.getElementById('genres-list');
        
        // Menampilkan genre
        genres.forEach(genre => {
            // Membuat elemen div untuk setiap genre
            const genreItem = document.createElement('div');
            genreItem.className = 'genre'; // Menambahkan kelas 'genre' ke elemen div
            genreItem.textContent = genre; // Menetapkan teks nama genre
            genresList.appendChild(genreItem); // Menambahkan elemen div ke genres-list
            
            genreItem.addEventListener('click', () => {
                // Navigasi ke halaman detail_genre.html dengan menyertakan genre yang dipilih sebagai parameter
                window.location.href = `detail_genre.html?genre=${encodeURIComponent(genre)}`;
            });
        });

    } catch (error) {
        console.error('Terjadi kesalahan saat menampilkan genre yang tersedia:', error); // Menangani error saat menampilkan genre
    }
}

// Panggil fungsi untuk menampilkan genre yang tersedia
displayAvailableGenres();
