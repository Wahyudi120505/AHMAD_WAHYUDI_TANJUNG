// Mengambil elemen dengan class 'bx'
const play = document.querySelector('.content .play-top .click .bx');

// Mengambil elemen dengan id 'music'
const music = document.getElementById('music');

// Menambahkan event listener pada elemen play
play.addEventListener('click', () => {
    // Memeriksa apakah musik sedang diputar (tidak sedang dijeda)
    if (music.paused) {
        // Jika musik dijeda, maka play musik
        music.play();
        // Mengubah ikon play menjadi pause
        play.classList.remove('bx-play-circle');
        play.classList.add('bx-pause-circle');
    } else {
        // Jika musik sedang diputar, maka jeda musik
        music.pause();
        // Mengubah ikon pause menjadi play
        play.classList.remove('bx-pause-circle');
        play.classList.add('bx-play-circle');
    }
});
