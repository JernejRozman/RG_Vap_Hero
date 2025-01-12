export class HUD {
    constructor(canvas) {
        this.startTime = Date.now();
        this.currentTime = 0;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
    }

    update() {
        this.currentTime = Math.floor((Date.now() - this.startTime) / 1000);
        this.drawHUD();
    }

    drawHUD() {
        const ctx = this.context;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear previous HUD
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Time: ${this.currentTime}s`, 10, 30);
    }
}

export default HUD;