const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

class Wave {
    constructor(y, amplitude, wavelength, speed, color) {
        this.y = y;
        this.amplitude = amplitude;
        this.wavelength = wavelength;
        this.speed = speed;
        this.color = color;
        this.time = 0;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;

        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;

        for (let x = 0; x < width; x++) {
            // sin(x - vt) logic for continuous travel
            // x * wavelength scales the spatial frequency
            // time * speed shifts the phase over time
            const yOffset = Math.sin(x * this.wavelength - this.time * this.speed) * this.amplitude;

            ctx.lineTo(x, this.y + yOffset);
        }

        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
        this.time += 1;
    }
}

class BackgroundNoise {
    constructor() {
        this.stars = [];
        this.init();
    }

    init() {
        this.stars = [];
        const numStars = (width * height) / 10000;
        for (let i = 0; i < numStars; i++) {
            this.stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 1.5,
                opacity: Math.random() * 0.5
            });
        }
    }

    draw(ctx) {
        ctx.fillStyle = '#fff';
        this.stars.forEach(star => {
            ctx.globalAlpha = star.opacity;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }
}

const waves = [
    new Wave(window.innerHeight / 2, 80, 0.003, 0.05, 'rgba(0, 243, 255, 0.8)'),     // Bright Cyan
    new Wave(window.innerHeight / 2, 60, 0.005, 0.03, 'rgba(0, 100, 255, 0.6)'),     // Deep Blue
    new Wave(window.innerHeight / 2, 100, 0.002, 0.02, 'rgba(0, 200, 255, 0.3)'),    // Faint outer
    new Wave(window.innerHeight / 2, 40, 0.008, 0.06, 'rgba(200, 255, 255, 0.5)')    // White/Bright highlight
];

const bg = new BackgroundNoise();

function animate() {
    // Clear with a slight fade for trails (optional, but clean clear preferred for this style)
    ctx.fillStyle = '#020205';
    ctx.fillRect(0, 0, width, height);

    bg.draw(ctx);

    waves.forEach(wave => {
        // Update vertical position dynamically to keep it centered
        wave.y = height / 2;
        wave.draw(ctx);
    });

    requestAnimationFrame(animate);
}

// Re-init background on resize
window.addEventListener('resize', () => bg.init());

animate();
