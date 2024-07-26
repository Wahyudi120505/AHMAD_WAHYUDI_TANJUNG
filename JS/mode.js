import { showPopup } from './popup.js'; // Mengimpor fungsi showPopup dari file popup.js untuk menampilkan notifikasi popup jika terjadi kesalahan

// Menambahkan event listener pada elemen dengan id 'mode'
document.getElementById('mode').addEventListener('click', function () {
    // Menambahkan atau menghapus kelas 'light-theme' pada elemen body
    document.body.classList.toggle('light-theme');

    // Mengakses elemen ikon secara langsung
    const icon = document.getElementById('mode'); // Mengambil elemen dengan id 'mode'

    // Memeriksa apakah elemen ikon memiliki kelas 'bxs-sun'
    if (icon.classList.contains('bxs-sun')) {
        // Jika memiliki kelas 'bxs-sun', maka hapus kelas 'bxs-sun' dan tambahkan kelas 'bxs-moon'
        icon.classList.remove('bxs-sun');
        icon.classList.add('bxs-moon');
    } else {
        // Jika tidak memiliki kelas 'bxs-sun', maka hapus kelas 'bxs-moon' dan tambahkan kelas 'bxs-sun'
        icon.classList.remove('bxs-moon');
        icon.classList.add('bxs-sun');
    }
});

// search
const submitButton = document.getElementById('submit');
const inputKeyword = document.getElementById('keyword');
const searchForm = document.getElementById('search');

submitButton.addEventListener('click', (e) => {
    // Mencegah form submit jika input kosong
    if (inputKeyword.value === '') {
        e.preventDefault();
        showPopup('Keyword tidak boleh kosong'); // Menambahkan pesan peringatan
    } else {
        // Menyimpan keyword ke localStorage
        localStorage.setItem('keyword', inputKeyword.value);
        // Melakukan submit form secara manual
        searchForm.submit();
    }
});

