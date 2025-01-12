// AudioController.js
class AudioController {
    constructor(audioFilePath) {
        this.audio = document.createElement('audio');
        this.audio.src = audioFilePath;
        this.audio.loop = true;
        this.audio.autoplay = false;  // Disable autoplay initially

        this.audio.addEventListener('canplaythrough', () => {
            console.log('Audio is ready to play.');
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio failed to load:', e);
        });

        document.body.appendChild(this.audio);
    }
}
// Handle Next Button Click
document.getElementById('next-button').addEventListener('click', () => {
    const infoBox = document.getElementById('info-box');
    const playButton = document.getElementById('play-button');

    // Fade out the info box
    infoBox.style.transition = 'opacity 1.5s ease-in-out';
    infoBox.style.opacity = '0';

    setTimeout(() => {
        infoBox.style.display = 'none'; // Hide the box completely

        // Fade in the play button
        playButton.style.transition = 'opacity 1.5s ease-in-out';
        playButton.style.opacity = '1'; // Make it visible
    }, 1500);
});

// Handle Play Button Click
document.getElementById('play-button').addEventListener('click', () => {
    const menu = document.getElementById('loading-menu');
    const gameInterface = document.getElementById('game-interface');

    // Start fading out the menu
    menu.style.opacity = '0';

    // Start fading in the game interface after menu fade starts
    setTimeout(() => {
        menu.style.display = 'none';
        gameInterface.style.opacity = '1'; // Fade in gameplay
    }, 1500);
    const audioController = new AudioController('./audio/test.mp3');
    audioController.audio.play().catch((error) => {
        console.error('Audio playback failed:', error);
    });
});

// Cloud generation logic
const cloudContainer = document.getElementById('loading-menu');

function generateCloud() {
    const cloud = document.createElement('div');
    cloud.classList.add('cloud');

    // Assign random size
    const sizeClass = `size-${Math.floor(Math.random() * 5) + 1}`;
    cloud.classList.add(sizeClass);

    // Set random vertical position
    cloud.style.top = `${Math.random() * 85}%`;

    // Set initial left position off-screen
    cloud.style.left = '-15%';

    // Append cloud to container
    cloudContainer.appendChild(cloud);

    // Animation duration based on size (faster than before)
    const speed = (parseInt(cloud.classList[1].split('-')[1]) * 4 + 10); // Reduced duration for speed

    // Add animation
    cloud.style.transition = `transform ${speed}s linear, opacity ${speed / 4}s ease-in-out`;

    // Start moving the cloud
    setTimeout(() => {
        cloud.style.transform = 'translateX(120vw)';
        cloud.style.opacity = '1';
    }, 1);

    // Remove the cloud after it finishes moving
    setTimeout(() => {
        cloud.style.opacity = '0';
    }, speed * 800);

    setTimeout(() => {
        cloud.remove();
    }, speed * 1000);
}

// Generate the first cloud immediately
generateCloud();

// Generate a new cloud every 2 seconds
setInterval(generateCloud, 1500);
