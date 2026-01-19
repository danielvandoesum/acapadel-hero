/**
 * ACAPADEL - SOLAR HERITAGE ENGINE
 * 
 * Core Components:
 * 1. AssetLoader: Handles image preloading with progress tracking.
 * 2. Scroller: Manages scroll position with LERP physics.
 * 3. Renderer: Draws the current frame to the canvas with "contain" fit.
 * 4. StoryController: Orchestrates the narrative based on scroll progress.
 */

// Configuration
const CONFIG = {
    frameCount: 192,
    framePath: (i) => `assets/sequence/frame_${i}.jpg`,
    lerpFactor: 0.05, // "Heavy" luxury feel
    scrollHeight: 5000, // Explicit scroll height assumption (500vh approx)
};

/* -------------------------------------------------------------------------- */
/*                                UTILS                                       */
/* -------------------------------------------------------------------------- */

// Linear Interpolation
const lerp = (start, end, t) => start * (1 - t) + end * t;

// Clamp helper
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* -------------------------------------------------------------------------- */
/*                             ASSET LOADER                                   */
/* -------------------------------------------------------------------------- */

class AssetLoader {
    constructor(frameCount, pathGenerator) {
        this.frameCount = frameCount;
        this.pathGenerator = pathGenerator;
        this.images = [];
        this.loadedCount = 0;
        this.progress = 0;
        this.onProgress = null;
        this.onComplete = null;
    }

    start() {
        for (let i = 0; i < this.frameCount; i++) {
            const img = new Image();
            img.src = this.pathGenerator(i);
            img.onload = () => this.handleLoad();
            img.onerror = (e) => {
                console.error(`Failed to load image: ${img.src}`);
                this.handleLoad();
            };
            this.images.push(img);
        }
    }

    handleLoad() {
        this.loadedCount++;
        this.progress = this.loadedCount / this.frameCount;

        if (this.onProgress) {
            this.onProgress(this.progress);
        }

        if (this.loadedCount === this.frameCount) {
            if (this.onComplete) {
                this.onComplete(this.images);
            }
        }
    }
}

/* -------------------------------------------------------------------------- */
/*                               RENDERER                                     */
/* -------------------------------------------------------------------------- */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.currentImage = null;
        this.resize();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // Handle High-DPI
        this.dpr = window.devicePixelRatio || 1;

        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;

        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;

        this.ctx.scale(this.dpr, this.dpr);
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        // Refill if image exists
        if (this.currentImage) {
            this.draw(this.currentImage);
        }
    }

    draw(image) {
        if (!image) return;
        // DEBUG LOG (Throttled)
        if (Math.random() < 0.01) console.log('Drawing frame', image.src);

        this.currentImage = image;

        const ctx = this.ctx;
        const canvasWidth = this.width;
        const canvasHeight = this.height;

        // Clear
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Calculate "contain" fit
        const imgRatio = image.width / image.height;
        const canvasRatio = canvasWidth / canvasHeight;

        let drawWidth, drawHeight;

        if (canvasRatio > imgRatio) {
            // Canvas is wider than image -> constrain by height
            drawHeight = canvasHeight;
            drawWidth = canvasHeight * imgRatio;
        } else {
            // Canvas is taller than image -> constrain by width
            drawWidth = canvasWidth;
            drawHeight = canvasWidth / imgRatio;
        }

        const offsetX = (canvasWidth - drawWidth) / 2;
        const offsetY = (canvasHeight - drawHeight) / 2;

        ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    }
}

/* -------------------------------------------------------------------------- */
/*                                SCROLLER                                    */
/* -------------------------------------------------------------------------- */

class Scroller {
    constructor(container) {
        this.container = container;
        this.scrollPos = 0;
        this.targetScrollPos = 0;
        this.maxScroll = 0;
        this.progress = 0; // 0 to 1

        this.updateDimensions();
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        window.addEventListener('resize', () => this.updateDimensions());
    }

    updateDimensions() {
        this.maxScroll = this.container.scrollHeight - window.innerHeight;
    }

    onScroll() {
        this.targetScrollPos = window.scrollY;
    }

    update() {
        // Physics Loop
        this.scrollPos = lerp(this.scrollPos, this.targetScrollPos, CONFIG.lerpFactor);

        // Avoid tiny jitter
        if (Math.abs(this.targetScrollPos - this.scrollPos) < 0.5) {
            this.scrollPos = this.targetScrollPos;
        }

        // Calculate normalized progress
        this.progress = clamp(this.scrollPos / this.maxScroll, 0, 1);
    }
}

/* -------------------------------------------------------------------------- */
/*                            STORY CONTROLLER                                */
/* -------------------------------------------------------------------------- */

class StoryController {
    constructor() {
        // DOM Elements
        this.container = document.querySelector('.scrolly-container');
        this.canvas = document.getElementById('hero-canvas');
        this.loaderEl = document.getElementById('loader');
        this.loaderProgressEl = document.getElementById('loader-progress');

        // Narrative Sections
        this.beats = {
            a: document.getElementById('beat-a'),
            b: document.getElementById('beat-b'),
            c: document.getElementById('beat-c'),
            d: document.getElementById('beat-d'),
        };

        // State
        this.images = [];
        this.isLoaded = false;

        // Init Subsystems
        this.loader = new AssetLoader(CONFIG.frameCount, CONFIG.framePath);
        this.renderer = new Renderer(this.canvas);
        this.scroller = new Scroller(this.container);

        this.init();
    }

    init() {
        // Setup Loader Callbacks
        this.loader.onProgress = (p) => {
            this.loaderProgressEl.style.width = `${p * 100}%`;
        };

        this.loader.onComplete = (imgs) => {
            this.images = imgs;
            this.isLoaded = true;
            this.reveal();
        };

        // Start Loading
        this.loader.start();

        // Start Loop
        this.tick();
    }

    reveal() {
        // Hide loader
        this.loaderEl.classList.add('hidden');
        // Show canvas
        this.canvas.classList.add('visible');
    }

    tick() {
        requestAnimationFrame(() => this.tick());

        if (!this.isLoaded) return;

        // 1. Update Scroll Physics
        this.scroller.update();
        const p = this.scroller.progress;

        // 2. Draw Frame
        const frameIndex = Math.min(
            CONFIG.frameCount - 1,
            Math.floor(p * CONFIG.frameCount)
        );
        this.renderer.draw(this.images[frameIndex]);

        // 3. Update Text Overlays (Story Beats)
        this.updateBeats(p);
    }

    updateBeats(progress) {
        // Helper to animate opacity/transform based on a range
        const animateBeat = (el, start, end) => {
            const center = (start + end) / 2;
            const range = end - start;

            // Distance from center of the beat (normalized 0-1)
            // We want 1 at center, 0 at edges
            let intensity = 1 - Math.abs(progress - center) / (range / 2);
            intensity = clamp(intensity, 0, 1);

            // Optional: Add a slight "slide up" effect
            const yOffset = (1 - intensity) * 30;

            el.style.opacity = intensity;
            el.style.transform = `translate(-50%, calc(-50% + ${yOffset}px))`;

            // Optimization for browser composition
            if (intensity <= 0.01) {
                el.style.visibility = 'hidden';
            } else {
                el.style.visibility = 'visible';
            }
        };

        // Define Ranges for each beat
        // [Start %, End %]
        animateBeat(this.beats.a, 0.0, 0.20);
        animateBeat(this.beats.b, 0.25, 0.45);
        animateBeat(this.beats.c, 0.50, 0.70);
        animateBeat(this.beats.d, 0.75, 1.0); // Stays visible at end?

        // Tweaked easing for the last beat to stay visible longer?
        // Actually, let's keep it consistent for now. 
        // If we want the last beat to stick, we'd change the logic:
        if (progress > 0.85) {
            this.beats.d.style.opacity = clamp((progress - 0.75) * 5, 0, 1);
            this.beats.d.style.transform = `translate(-50%, -50%)`;
            this.beats.d.style.visibility = 'visible';
        }
    }
}

// Instantiate
document.addEventListener('DOMContentLoaded', () => {
    new StoryController();
});
