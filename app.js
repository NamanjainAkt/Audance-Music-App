function getSongs() {
    return [
        "assets/songs/attention.mp3",
        "assets/songs/Blue-Yung-Kai.mp3",
        "assets/songs/Husn.mp3",
        "assets/songs/Jo Tum Mere Ho.mp3",
        "assets/songs/Unstoppable.mp3",
        "assets/songs/Middle Of The Night.mp3",
        "assets/songs/Maine Royaan x Somebody_s Me.mp3",
        "assets/songs/Lokiverse.mp3",
        "assets/songs/Let Me Down Slowly x Main Dhoondne Ko .mp3",
        "assets/songs/Lambiya judaiyan.mp3",
        "assets/songs/Excuses.mp3",
        "assets/songs/Can We kiss forever.mp3",
        "assets/songs/Bones.mp3",
        "assets/songs/Believer.mp3",
        "assets/songs/Bad Boy.mp3",
        "assets/songs/Baby.mp3",
    ];
}

let currentAudio = null;
let currentPlayingLi = null;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Update the handleSongClick function
function handleSongClick(songPath, liElement) {
    const playIcon = liElement.querySelector('.play-icon');
    const playbarPlayBtn = document.querySelector('.songbtns .fa-play, .songbtns .fa-pause');
    
    // If clicking the same song that's currently playing
    if (currentPlayingLi === liElement && currentAudio) {
        togglePlayPause(playIcon, playbarPlayBtn);
        return;
    }
    
    // Reset previous song's play button if exists
    if (currentPlayingLi) {
        const prevPlayIcon = currentPlayingLi.querySelector('.play-icon');
        prevPlayIcon.classList.replace('fa-pause', 'fa-play');
    }
    
    // If there's a different song playing, stop it
    if (currentAudio) {
        currentAudio.pause();
        playbarPlayBtn.classList.replace('fa-pause', 'fa-play');
    }
    
    // Play new song
    currentAudio = new Audio(songPath);
    currentAudio.play().catch(e => console.log("Playback failed:", e));
    
    // Update icons
    playIcon.classList.replace('fa-play', 'fa-pause');
    playbarPlayBtn.classList.replace('fa-play', 'fa-pause');
    currentPlayingLi = liElement;
    
    // Update playbar
    updatePlaybar(songPath);
    
    // Add ended event listener
    currentAudio.addEventListener('ended', () => {
        playIcon.classList.replace('fa-pause', 'fa-play');
        playbarPlayBtn.classList.replace('fa-pause', 'fa-play');
        playNext();
    });
}

// Update the togglePlayPause function
function togglePlayPause(playIcon, playbarPlayBtn) {
    if (!currentAudio) return;
    
    if (currentAudio.paused) {
        currentAudio.play();
        // Update both song list and playbar icons
        if (playIcon) playIcon.classList.replace('fa-play', 'fa-pause');
        if (playbarPlayBtn) playbarPlayBtn.classList.replace('fa-play', 'fa-pause');
    } else {
        currentAudio.pause();
        // Update both song list and playbar icons
        if (playIcon) playIcon.classList.replace('fa-pause', 'fa-play');
        if (playbarPlayBtn) playbarPlayBtn.classList.replace('fa-pause', 'fa-play');
    }
}

function playPrevious() {
    if (!currentPlayingLi) return;
    const prevLi = currentPlayingLi.previousElementSibling;
    if (prevLi) handleSongClick(prevLi.dataset.songPath, prevLi);
}

function playNext() {
    if (!currentPlayingLi) return;
    const nextLi = currentPlayingLi.nextElementSibling;
    if (nextLi) handleSongClick(nextLi.dataset.songPath, nextLi);
}

function updatePlaybar(songPath) {
    const songName = songPath.split("/").pop().replace(".mp3", "").replaceAll("%20", " ");
    document.querySelector('.songdetails h4').textContent = songName;
    
    const timeline = document.querySelector('.songtime input');
    const currentTime = document.querySelector('.current-time');
    const totalDuration = document.querySelector('.total-duration');

    // Update timeline when metadata is loaded
    currentAudio.addEventListener('loadedmetadata', () => {
        totalDuration.textContent = formatTime(currentAudio.duration);
        timeline.max = currentAudio.duration;
        timeline.value = 0;
    });

    // Update timeline during playback
    currentAudio.addEventListener('timeupdate', () => {
        currentTime.textContent = formatTime(currentAudio.currentTime);
        timeline.value = currentAudio.currentTime;
        const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
        timeline.style.backgroundSize = `${progress}% 100%`;
    });

    // Handle timeline seeking
    timeline.addEventListener('input', () => {
        currentAudio.currentTime = timeline.value;
        const progress = (timeline.value / currentAudio.duration) * 100;
        timeline.style.backgroundSize = `${progress}% 100%`;
        currentTime.textContent = formatTime(timeline.value);
    });

    // Add volume control functionality
    const volumeRange = document.querySelector('.volume_range input');
    const volumeIcon = document.querySelector('.volume i');

    // Set initial volume
    currentAudio.volume = volumeRange.value / 100;
    volumeRange.style.backgroundSize = `${volumeRange.value}% 100%`;

    // Update volume on change
    volumeRange.addEventListener('input', () => {
        const volumeValue = volumeRange.value;
        currentAudio.volume = volumeValue / 100;
        volumeRange.style.backgroundSize = `${volumeValue}% 100%`;
        
        // Update volume icon based on volume level
        if (volumeValue == 0) {
            volumeIcon.classList.replace('fa-volume-high', 'fa-volume-xmark');
        } else {
            volumeIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
        }
    });

    // Toggle mute on volume icon click
    volumeIcon.addEventListener('click', () => {
        if (currentAudio.volume > 0) {
            currentAudio.volume = 0;
            volumeRange.value = 0;
            volumeRange.style.backgroundSize = '0% 100%';
            volumeIcon.classList.replace('fa-volume-high', 'fa-volume-xmark');
        } else {
            currentAudio.volume = 1;
            volumeRange.value = 100;
            volumeRange.style.backgroundSize = '100% 100%';
            volumeIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
        }
    });
}

function createSongList(songs, searchTerm = '') {
    const songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = '';

    const fragment = document.createDocumentFragment();
    songs.forEach(song => {
        const songName = song.split("/").pop().replace(".mp3", "").replaceAll("%20", " ");
        if (searchTerm && !songName.toLowerCase().includes(searchTerm.toLowerCase())) return;

        const li = document.createElement('li');
        li.dataset.songPath = song;
        li.innerHTML = `<span class="song-name">${songName}</span> <i class="fas fa-play play-icon"></i>`;
        li.onclick = () => handleSongClick(song, li);

        fragment.appendChild(li);
    });

    songUL.appendChild(fragment);
}

function initializeSearch() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        createSongList(getSongs(), e.target.value.trim());
    });
}

// Update the initializePlaybarControls function
function initializePlaybarControls() {
    const prevBtn = document.querySelector('.songbtns .fa-angles-left');
    const playPauseBtn = document.querySelector('.songbtns .fa-play, .songbtns .fa-pause');
    const nextBtn = document.querySelector('.songbtns .fa-angles-right');

    prevBtn.onclick = playPrevious;
    
    playPauseBtn.onclick = () => {
        if (!currentAudio || !currentPlayingLi) return;
        
        const songPlayIcon = currentPlayingLi.querySelector('.play-icon');
        togglePlayPause(songPlayIcon, playPauseBtn);
    };
    
    nextBtn.onclick = playNext;
}

function main() {
    const songs = getSongs();
    createSongList(songs);
    initializeSearch();
    initializePlaybarControls();
}

document.addEventListener('DOMContentLoaded', main);
