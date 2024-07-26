// Fungsi untuk menampilkan popup dengan pesan
export function showPopup(message) {
    // Membuat elemen popup jika belum ada
    let popup = document.getElementById('popup');
    
    // Jika elemen popup belum ada, maka buat elemen popup
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'popup';
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.padding = '20px';
        popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        popup.style.color = 'white';
        popup.style.borderRadius = '5px';
        popup.style.zIndex = '1000';
        document.body.appendChild(popup);
    }

    // Menetapkan pesan ke elemen popup
    popup.textContent = message;
    popup.style.display = 'block';

    // Menghilangkan popup setelah beberapa detik
    setTimeout(() => {
        popup.style.display = 'none';
    }, 3000);
}
