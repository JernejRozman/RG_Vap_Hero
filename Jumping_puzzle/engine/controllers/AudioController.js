export class AudioController {
    constructor(audioFilePath) {
        this.audio = document.createElement('audio');
        this.audio.src = audioFilePath;
        this.audio.loop = true;
        this.audio.autoplay = false; 

        this.audio.addEventListener('canplaythrough', () => {
            console.log('Audio is ready to play.');
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio failed to load:', e);
        });

        document.body.appendChild(this.audio);
    }
}

