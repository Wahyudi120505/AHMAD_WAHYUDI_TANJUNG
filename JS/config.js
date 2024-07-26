export const CLIENT_ID = '5627c8dfe2ff4d7a823bd0e829db0fd7'; // ID klien Spotify
export const CLIENT_SECRET = 'ed48cb79aa5f403c86a9a73a92fe2af4'; // Rahasia klien Spotify
export const TOKEN_URL = 'https://accounts.spotify.com/api/token'; // URL untuk mendapatkan token akses

// export const CLIENT_ID = 'a4e0396bed2c40c785bc5bd0f7da9d34'; // ID klien Spotify
// export const CLIENT_SECRET = '162f6be2f86440b89582952ad09fb0c0'; // Rahasia klien Spotify
// export const TOKEN_URL = 'https://accounts.spotify.com/api/token'; // URL untuk mendapatkan token akses


// Fungsi asinkron untuk mendapatkan token akses dari Spotify
export async function getAccessToken() {
    try {
        // Melakukan permintaan POST ke Spotify API untuk mendapatkan token akses
        const response = await fetch(TOKEN_URL, {
            method: 'POST', // Metode permintaan POST
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // Tipe konten permintaan
                'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET) // Menyertakan header Authorization dengan Basic Auth
            },
            body: 'grant_type=client_credentials' // Data body permintaan untuk grant_type
        });

        // Memeriksa apakah respons dari API berhasil (status HTTP 200-299)
        if (!response.ok) {
            // Jika status tidak ok, lemparkan error dengan pesan status
            throw new Error(`Error! Status: ${response.status}`);
        }

        // Mengambil data dari respons dalam bentuk JSON dan mengubahnya menjadi objek JavaScript
        const data = await response.json();
        const accessToken = data.access_token;

        // Simpan access token ke local storage agar bisa digunakan di tempat lain
        localStorage.setItem('spotify_access_token', accessToken);

        // Mengembalikan token akses
        return accessToken;
    } catch (error) {
        // Menangani error jika terjadi kesalahan saat mengambil token akses
        console.error('Terjadi kesalahan saat mengambil token akses:', error);
        throw error;
    }
}
