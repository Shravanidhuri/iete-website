const canvas = document.getElementById('wave-canvas');
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
    // We can use a transparent clear or the background color from CSS
    // Using a clearRect allows the CSS background gradient to show through
    ctx.clearRect(0, 0, width, height);

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

/* =========================================
   MOBILE MENU LOGIC
   ========================================= */
const menuToggle = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links li a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

/* =========================================
   WORKSHOPS SECTION LOGIC
   ========================================= */
(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const cards = document.querySelectorAll('.workshop-card');
        const turbulence = document.querySelector('#electric-spark-filter feTurbulence');

        // Spark Animation
        const EDGE_DURATION = 0.4;
        const CORNER_DURATION = 0.1;
        const CARD_Total = (EDGE_DURATION + CORNER_DURATION) * 4;
        const ROW_TOTAL_TIME = CARD_Total * 3;

        const cardArray = Array.from(cards);
        // Split into chunks of 3 roughly (or just animate all)
        // Original logic split by rows. Let's simplify and animate all but stagger.

        let globalDelay = 0;
        cards.forEach((card, index) => {
            // Create SVG container if not exists (it is in HTML now, but empty)
            let borderContainer = card.querySelector('.card-border');
            if (!borderContainer) return;

            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.classList.add('spark-svg');

            // We need to wait for layout to get dimensions? 
            // Better to do this on load or ResizeObserver.
            // For now, assume fixed size or simple relative.
            // Actually chips are responsive. 
            // The original script calculated width/height. 
            // We'll wrap this in a function we can call on resize.

            function buildSparks() {
                const { width, height } = card.getBoundingClientRect();
                if (width === 0 || height === 0) return;

                svg.innerHTML = ''; // Clear old
                const r = 15;
                const w = width;
                const h = height;

                // Base Circuit
                const baseRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                baseRect.classList.add('circuit-base');
                baseRect.setAttribute('x', '1');
                baseRect.setAttribute('y', '1');
                baseRect.setAttribute('width', w - 2);
                baseRect.setAttribute('height', h - 2);
                baseRect.setAttribute('rx', r);
                baseRect.setAttribute('ry', r);
                svg.appendChild(baseRect);

                const createSegment = (pathData, duration, type) => {
                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    path.setAttribute('d', pathData);
                    if (type === 'edge') {
                        path.classList.add('spark-edge');
                        path.style.animation = `draw-line ${ROW_TOTAL_TIME}s linear infinite`;
                        let segmentLength = 20;
                        if (pathData.includes(`H ${w - r}`)) segmentLength = (w - r) - r;
                        else if (pathData.includes(`V ${h - r}`)) segmentLength = (h - r) - r;
                        else if (pathData.includes(`H ${r}`)) segmentLength = (w - r) - r;
                        else if (pathData.includes(`V ${r}`)) segmentLength = (h - r) - r;
                        path.style.setProperty('--length', segmentLength + 20);
                        path.style.strokeDasharray = segmentLength + 20;
                    } else {
                        path.classList.add('spark-corner');
                        path.style.animation = `corner-flash ${ROW_TOTAL_TIME}s linear infinite`;
                    }
                    path.style.animationDelay = `${globalDelay}s`;
                    svg.appendChild(path);
                    globalDelay += duration;
                };

                createSegment(`M ${r} 1 H ${w - r}`, EDGE_DURATION, 'edge');
                createSegment(`M ${w - r} 1 Q ${w - 1} 1 ${w - 1} r`, CORNER_DURATION, 'corner');
                createSegment(`M ${w - 1} r V ${h - r}`, EDGE_DURATION, 'edge');
                createSegment(`M ${w - 1} h-r Q ${w - 1} ${h - 1} ${w - r} ${h - 1}`.replace('h-r', h - r).replace('h-1', h - 1).replace('h-1', h - 1), CORNER_DURATION, 'corner');
                createSegment(`M ${w - r} ${h - 1} H ${r}`, EDGE_DURATION, 'edge');
                createSegment(`M ${r} ${h - 1} Q 1 ${h - 1} 1 ${h - r}`, CORNER_DURATION, 'corner');
                createSegment(`M 1 ${h - r} V ${r}`, EDGE_DURATION, 'edge');
                createSegment(`M 1 r Q 1 1 ${r} 1`, CORNER_DURATION, 'corner');
            }

            // Initial build
            // setTimeout to ensure layout is done
            setTimeout(buildSparks, 100);

            borderContainer.appendChild(svg);
        });

        // Turbulence Animation
        let filterTime = 0;
        function animateFilter() {
            if (turbulence) {
                filterTime += 0.05;
                const freq = 0.8 + Math.sin(filterTime) * 0.02;
                turbulence.setAttribute('baseFrequency', `${freq} ${freq}`);
            }
            requestAnimationFrame(animateFilter);
        }
        animateFilter();
    });
})();

/* =========================================
   PAST EVENTS SECTION LOGIC (EXACT PORT)
   ========================================= */
(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const section = document.getElementById('past-events');
        if (!section) return;

        // Scope queries to the section
        const discWrapper = section.querySelector('.disc-wrapper');
        const items = section.querySelectorAll('.event-item');
        const infoBox = section.querySelector('#info-box');

        // Info Box Elements
        const titleEl = section.querySelector('#event-title');
        const dateEl = section.querySelector('#event-date');
        const descEl = section.querySelector('#event-desc');

        if (!discWrapper) return;

        // Radius of the circle on which items are placed
        // We calculate dynamically based on disc size
        function updatePositions() {
            let currentSize = discWrapper.offsetWidth;
            // Radius: slightly inside the edge.
            // Reference logic: (currentSize / 2) * 0.80
            const radius = (currentSize / 2) * 0.80;

            const totalItems = items.length;
            const angleStep = 360 / totalItems;

            items.forEach((item, index) => {
                const angle = index * angleStep;
                const angleRad = angle * (Math.PI / 180);

                const x = radius * Math.cos(angleRad);
                const y = radius * Math.sin(angleRad);

                // Use margin offsets from center (50% 50%)
                item.style.left = `calc(50% + ${x}px)`;
                item.style.top = `calc(50% + ${y}px)`;
                item.style.transform = ''; // Clear default transform if any
            });
        }

        // Initial Position
        updatePositions();
        window.addEventListener('resize', updatePositions);

        // Interaction Logic
        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                // Stop rotation
                discWrapper.classList.add('paused');

                // Show Info
                const title = item.getAttribute('data-title');
                const date = item.getAttribute('data-date');
                const desc = item.getAttribute('data-desc');

                if (titleEl) titleEl.textContent = title;
                if (dateEl) dateEl.textContent = date;
                if (descEl) descEl.textContent = desc;

                if (infoBox) infoBox.classList.add('active');
            });

            item.addEventListener('mouseleave', () => {
                // Resume rotation
                discWrapper.classList.remove('paused');
                // Hide info
                if (infoBox) infoBox.classList.remove('active');
            });
        });

        // Renaissance Text Interactivity
        const renaissanceWords = section.querySelectorAll('.renaissance-word');
        renaissanceWords.forEach(word => {
            word.addEventListener('mouseenter', () => {
                discWrapper.classList.add('paused');
                if (infoBox) {
                    infoBox.classList.add('active');
                    infoBox.classList.add('renaissance-theme');
                }

                const title = word.getAttribute('data-title');
                const date = word.getAttribute('data-date');
                const desc = word.getAttribute('data-desc');

                if (titleEl) titleEl.textContent = title;
                if (dateEl) dateEl.textContent = date;
                if (descEl) descEl.textContent = desc;
            });

            word.addEventListener('mouseleave', () => {
                discWrapper.classList.remove('paused');
                if (infoBox) infoBox.classList.remove('active');

                // Delay removal of theme slightly
                setTimeout(() => {
                    if (infoBox && !infoBox.classList.contains('active')) {
                        infoBox.classList.remove('renaissance-theme');
                    }
                }, 300);
            });
        });
    });
})();

/* =========================================
   TEAMS SECTION LOGIC
   ========================================= */
(() => {
    /* ============================================================
       TEAM DATA
       ============================================================ */
    const coreMembers = [
        {
            name: "Rohan Mehta",
            position: "Chairperson",
            photo: "https://i.pravatar.cc/400?img=11",
            model: "IC-001",
            bio: "Visionary leader steering IETE KJSIT towards new horizons. Passionate about embedded systems, IoT, and fostering a culture of innovation across the student community.",
            socials: { linkedin: "#", github: "#", instagram: "#" },
        },
        {
            name: "Aarav Mehta",
            position: "Vice Chairperson",
            photo: "https://i.pravatar.cc/400?img=12",
            model: "IC-002",
            bio: "Strategic planner and the backbone of operations. Specializes in circuit design and VLSI with a knack for transforming ideas into executable projects.",
            socials: { linkedin: "#", github: "#", instagram: "#" },
        },
        {
            name: "Sneha Patil",
            position: "Secretary",
            photo: "https://i.pravatar.cc/400?img=5",
            model: "IC-003",
            bio: "Organizational powerhouse keeping every gear in motion. Expert in communication systems and digital signal processing with impeccable planning skills.",
            socials: { linkedin: "#", github: "#", instagram: "#" },
        },
        {
            name: "Rohan Desai",
            position: "Treasurer",
            photo: "https://i.pravatar.cc/400?img=14",
            model: "IC-004",
            bio: "Financial architect ensuring optimal resource allocation. Background in power electronics and renewable energy systems with an analytical mind.",
            socials: { linkedin: "#", github: "#", instagram: "#" },
        },
        {
            name: "Priya Sharma",
            position: "Technical Head",
            photo: "https://i.pravatar.cc/400?img=9",
            model: "IC-005",
            bio: "Code alchemist and hardware whisperer. Leads all technical initiatives with expertise in microcontrollers, PCB design, and full-stack development.",
            socials: { linkedin: "#", github: "#", instagram: "#" },
        },
        {
            name: "Arjun Nair",
            position: "Event Head",
            photo: "https://i.pravatar.cc/400?img=15",
            model: "IC-006",
            bio: "Creative force behind every memorable event. Blends technical workshops with engaging experiences that leave a lasting impact on participants.",
            socials: { linkedin: "#", github: "#", instagram: "#" },
        },
    ];

    const subcoreMembers = [
        {
            name: "Kavya Joshi",
            position: "Technical Coordinator",
            photo: "https://i.pravatar.cc/400?img=20",
            model: "SC-001",
            bio: "Drives technical workshops and hands-on sessions. Passionate about AI/ML and bridging the gap between theoretical knowledge and practical application.",
            socials: { linkedin: "#", github: "#" },
        },
        {
            name: "Vedant Kulkarni",
            position: "Creative Head",
            photo: "https://i.pravatar.cc/400?img=33",
            model: "SC-002",
            bio: "Visual storyteller crafting the digital identity of IETE. Expert in UI/UX design, motion graphics, and creating compelling visual narratives.",
            socials: { linkedin: "#", instagram: "#" },
        },
        {
            name: "Ananya Rao",
            position: "PR & Outreach",
            photo: "https://i.pravatar.cc/400?img=25",
            model: "SC-003",
            bio: "Building bridges between IETE and the wider tech community. Manages partnerships, social media presence, and external communications.",
            socials: { linkedin: "#", instagram: "#" },
        },
        {
            name: "Siddhesh More",
            position: "Content Lead",
            photo: "https://i.pravatar.cc/400?img=53",
            model: "SC-004",
            bio: "Wordsmith architecting the voice of IETE KJSIT. Creates engaging technical content, newsletters, and documentation with precision.",
            socials: { linkedin: "#", github: "#" },
        },
        {
            name: "Ishita Verma",
            position: "Social Media Head",
            photo: "https://i.pravatar.cc/400?img=44",
            model: "SC-005",
            bio: "Digital strategist amplifying IETE's online presence. Masters the art of engagement through innovative social media campaigns and reels.",
            socials: { linkedin: "#", instagram: "#" },
        },
        {
            name: "Omkar Bhosale",
            position: "Logistics Coordinator",
            photo: "https://i.pravatar.cc/400?img=60",
            model: "SC-006",
            bio: "The silent engine behind seamless event execution. Manages venues, equipment, and coordination ensuring zero downtime on event day.",
            socials: { linkedin: "#", github: "#" },
        },
        {
            name: "Riya Gupta",
            position: "Design Coordinator",
            photo: "https://i.pravatar.cc/400?img=30",
            model: "SC-007",
            bio: "Pixel-perfect designer bringing every poster, banner, and digital asset to life. Skilled in Figma, Illustrator, and creative branding.",
            socials: { linkedin: "#", instagram: "#" },
        },
        {
            name: "Aditya Sawant",
            position: "Web Developer",
            photo: "https://i.pravatar.cc/400?img=52",
            model: "SC-008",
            bio: "Full-stack developer maintaining and building IETE's digital infrastructure. Proficient in React, Node.js, and cloud deployments.",
            socials: { linkedin: "#", github: "#" },
        },
    ];

    /* ============================================================
       PARTICLE CANVAS NETWORK
       ============================================================ */
    const canvas = document.getElementById("particleCanvas");
    if (canvas) {
        const ctx = canvas.getContext("2d", { alpha: true });
        let particles = [];
        let mouse = { x: -1000, y: -1000 };
        const isMobile = window.matchMedia("(max-width: 768px)").matches;
        const PARTICLE_COUNT = isMobile ? 25 : 40;
        const CONNECTION_DIST = 140;
        const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST;
        const MOUSE_DIST = 200;
        const MOUSE_DIST_SQ = MOUSE_DIST * MOUSE_DIST;
        let animationRunning = true;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        let resizeTimeout;
        window.addEventListener(
            "resize",
            () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(resizeCanvas, 150);
            },
            { passive: true },
        );

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.r = Math.random() * 1.5 + 0.5;
                this.baseAlpha = Math.random() * 0.3 + 0.1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 180, 216, ${this.baseAlpha})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

        function animateParticles() {
            if (!animationRunning) {
                requestAnimationFrame(animateParticles);
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }

            // Draw connections
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < CONNECTION_DIST_SQ) {
                        const alpha = 1 - Math.sqrt(distSq) / CONNECTION_DIST;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(0, 180, 216, ${alpha * 0.2})`;
                        ctx.stroke();
                    }
                }
            }

            // Mouse interactions
            if (mouse.x > 0 && mouse.y > 0) {
                for (let i = 0; i < particles.length; i++) {
                    const pi = particles[i];
                    const dx = pi.x - mouse.x;
                    const dy = pi.y - mouse.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < MOUSE_DIST_SQ) {
                        const forceDirectionX = dx / Math.sqrt(distSq);
                        const forceDirectionY = dy / Math.sqrt(distSq);
                        const force = (MOUSE_DIST - Math.sqrt(distSq)) / MOUSE_DIST;
                        const directionX = forceDirectionX * force * 0.6;
                        const directionY = forceDirectionY * force * 0.6;
                        pi.x += directionX;
                        pi.y += directionY;
                    }
                }
                // Mouse connections
                for (let i = 0; i < particles.length; i++) {
                    const pi = particles[i];
                    const dx = pi.x - mouse.x;
                    const dy = pi.y - mouse.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < MOUSE_DIST_SQ) {
                        const dist = Math.sqrt(distSq);
                        const alpha = (1 - dist / MOUSE_DIST) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(pi.x, pi.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

        // Pause particle animation when tab not visible
        document.addEventListener("visibilitychange", () => {
            animationRunning = !document.hidden;
        });

        // Mouse move
        document.addEventListener(
            "mousemove",
            (e) => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            },
            { passive: true },
        );
    }

    /* ============================================================
       CIRCUIT TRACE SVG GENERATOR
       ============================================================ */
    function circuitSVG(idx) {
        const seed = idx * 137;
        const r = (n) => ((seed + n * 31) % 100) / 100;
        const cx = 175,
            cy = 175;
        const hw = 112,
            hh = 136;
        const t = [];

        // We generate both visual traces and "flow" overlay traces for electricity effect
        const flowPaths = [];

        // Left traces
        for (let i = 0; i < 8; i++) {
            const y = cy - 100 + i * 28;
            const x1 = cx - hw - 24;
            const bendX = x1 - 15 - r(i) * 50;
            const endX = Math.max(0, bendX - 20 - r(i + 10) * 30);
            const endY = y + (r(i + 20) - 0.5) * 50;
            const pts = `${x1},${y} ${bendX},${y} ${bendX},${endY} ${endX},${endY}`;
            t.push(`<polyline class="trace-line" points="${pts}"/>`);
            flowPaths.push(
                `<polyline class="trace-flow" points="${pts}" style="animation-delay:${(r(i) * 0.5).toFixed(2)}s"/>`,
            );
            t.push(
                `<circle class="trace-node pulse-node" cx="${bendX}" cy="${y}" r="2.5" style="animation-delay:${(r(i) * 3).toFixed(1)}s"/>`,
            );
            if (r(i + 5) > 0.35)
                t.push(
                    `<circle class="trace-node" cx="${endX}" cy="${endY}" r="2"/>`,
                );
            if (r(i + 5) > 0.55)
                t.push(
                    `<circle class="trace-node-ring" cx="${endX}" cy="${endY}" r="5"/>`,
                );
            if (r(i + 30) > 0.6) {
                const mx = (bendX + endX) / 2;
                t.push(
                    `<rect class="trace-component" x="${mx - 5}" y="${endY - 3}" width="10" height="6" rx="1"/>`,
                );
            }
        }

        // Right traces
        for (let i = 0; i < 8; i++) {
            const y = cy - 100 + i * 28;
            const x1 = cx + hw + 24;
            const bendX = x1 + 15 + r(i + 8) * 50;
            const endX = Math.min(350, bendX + 20 + r(i + 18) * 30);
            const endY = y + (r(i + 28) - 0.5) * 50;
            const pts = `${x1},${y} ${bendX},${y} ${bendX},${endY} ${endX},${endY}`;
            t.push(`<polyline class="trace-line" points="${pts}"/>`);
            flowPaths.push(
                `<polyline class="trace-flow" points="${pts}" style="animation-delay:${(r(i + 3) * 0.5).toFixed(2)}s"/>`,
            );
            t.push(
                `<circle class="trace-node pulse-node" cx="${bendX}" cy="${y}" r="2.5" style="animation-delay:${(r(i + 3) * 3).toFixed(1)}s"/>`,
            );
            if (r(i + 12) > 0.35)
                t.push(
                    `<circle class="trace-node" cx="${endX}" cy="${endY}" r="2"/>`,
                );
            if (r(i + 12) > 0.55)
                t.push(
                    `<circle class="trace-node-ring" cx="${endX}" cy="${endY}" r="5"/>`,
                );
            if (r(i + 40) > 0.6) {
                const mx = (bendX + endX) / 2;
                t.push(
                    `<rect class="trace-component" x="${mx - 5}" y="${endY - 3}" width="10" height="6" rx="1"/>`,
                );
            }
        }

        // Top traces
        for (let i = 0; i < 7; i++) {
            const x = cx - 72 + i * 24;
            const y1 = cy - hh - 20;
            const bendY = y1 - 12 - r(i + 40) * 30;
            const endY = Math.max(0, bendY - 15 - r(i + 50) * 20);
            const endX = x + (r(i + 60) - 0.5) * 40;
            const pts = `${x},${y1} ${x},${bendY} ${endX},${bendY} ${endX},${endY}`;
            t.push(`<polyline class="trace-line" points="${pts}"/>`);
            flowPaths.push(
                `<polyline class="trace-flow" points="${pts}" style="animation-delay:${(r(i + 6) * 0.5).toFixed(2)}s"/>`,
            );
            t.push(
                `<circle class="trace-node pulse-node" cx="${x}" cy="${bendY}" r="2" style="animation-delay:${(r(i + 6) * 3).toFixed(1)}s"/>`,
            );
            if (r(i + 45) > 0.5) {
                const my = (bendY + endY) / 2;
                t.push(
                    `<rect class="trace-component" x="${endX - 3}" y="${my - 5}" width="6" height="10" rx="1"/>`,
                );
            }
        }

        // Bottom traces
        for (let i = 0; i < 7; i++) {
            const x = cx - 72 + i * 24;
            const y1 = cy + hh + 20;
            const bendY = y1 + 12 + r(i + 70) * 30;
            const endY = Math.min(350, bendY + 15 + r(i + 80) * 20);
            const endX = x + (r(i + 90) - 0.5) * 40;
            const pts = `${x},${y1} ${x},${bendY} ${endX},${bendY} ${endX},${endY}`;
            t.push(`<polyline class="trace-line" points="${pts}"/>`);
            flowPaths.push(
                `<polyline class="trace-flow" points="${pts}" style="animation-delay:${(r(i + 9) * 0.5).toFixed(2)}s"/>`,
            );
            t.push(
                `<circle class="trace-node pulse-node" cx="${x}" cy="${bendY}" r="2" style="animation-delay:${(r(i + 9) * 3).toFixed(1)}s"/>`,
            );
            if (r(i + 75) > 0.5) {
                const my = (bendY + endY) / 2;
                t.push(
                    `<rect class="trace-component" x="${endX - 3}" y="${my - 5}" width="6" height="10" rx="1"/>`,
                );
            }
        }

        // Corner diagonal traces
        [
            { sx: cx - hw, sy: cy - hh, dx: -1, dy: -1 },
            { sx: cx + hw, sy: cy - hh, dx: 1, dy: -1 },
            { sx: cx - hw, sy: cy + hh, dx: -1, dy: 1 },
            { sx: cx + hw, sy: cy + hh, dx: 1, dy: 1 },
        ].forEach((c, ci) => {
            const mid = 35 + r(ci + 90) * 25;
            const ex = c.sx + c.dx * mid;
            const ey = c.sy + c.dy * mid;
            t.push(
                `<line class="trace-line" x1="${c.sx}" y1="${c.sy}" x2="${ex}" y2="${ey}"/>`,
            );
            t.push(`<circle class="trace-node" cx="${ex}" cy="${ey}" r="3"/>`);
            t.push(
                `<circle class="trace-node-ring" cx="${ex}" cy="${ey}" r="6"/>`,
            );
        });

        return `<svg viewBox="0 0 350 350" preserveAspectRatio="xMidYMid meet">${t.join("")}${flowPaths.join("")}</svg>`;
    }

    /* ============================================================
       DATA STREAM TEXT GENERATOR
       ============================================================ */
    function generateDataStream() {
        const chars = "01";
        let str = "";
        for (let i = 0; i < 24; i++)
            str += chars[Math.floor(Math.random() * 2)];
        return str;
    }

    /* ============================================================
       CREATE CARD HTML
       ============================================================ */
    function createCard(member, type, idx) {
        const pH = 8,
            pV = 7;
        const pL = Array(pH).fill('<div class="pin-h"></div>').join("");
        const pR = Array(pH).fill('<div class="pin-h"></div>').join("");
        const pT = Array(pV).fill('<div class="pin-vt"></div>').join("");
        const pB = Array(pV).fill('<div class="pin-vt"></div>').join("");

        return `
    <div class="chip-card" data-member='${JSON.stringify(member).replace(/'/g, "&#39;")}' data-type="${type}" data-idx="${idx}">
        <div class="circuit-traces">${circuitSVG(idx)}</div>
        <div class="data-stream" style="top: 15%; left: -10px; transform: rotate(-90deg);">${generateDataStream()}</div>
        <div class="data-stream" style="bottom: 10%; right: -10px; transform: rotate(90deg);">${generateDataStream()}</div>
        <div class="processor-3d">
            <div class="processor">
                <div class="chip-pins chip-pins-left">${pL}</div>
                <div class="chip-pins chip-pins-right">${pR}</div>
                <div class="chip-pins chip-pins-top">${pT}</div>
                <div class="chip-pins chip-pins-bottom">${pB}</div>
                <div class="processor-frame">
                    <div class="processor-notch"></div>
                    <div class="processor-model">${member.model}</div>
                    <div class="processor-detail processor-detail-top"></div>
                    <div class="corner-accent corner-accent--tl"></div>
                    <div class="corner-accent corner-accent--tr"></div>
                    <div class="corner-accent corner-accent--bl"></div>
                    <div class="corner-accent corner-accent--br"></div>
                </div>
                <div class="processor-photo-wrap">
                    <div class="processor-photo-border">
                        <img class="processor-photo" src="${member.photo}" alt="${member.name}" loading="lazy">
                    </div>
                </div>
                <div class="processor-info">
                    <div class="processor-name">${member.name}</div>
                    <div class="processor-position">${member.position}</div>
                </div>
            </div>
        </div>
    </div>`;
    }

    /* ============================================================
       RENDER CARDS
       ============================================================ */
    const coreGrid = document.getElementById("coreGrid");
    const subcoreGrid = document.getElementById("subcoreGrid");

    if (coreGrid) {
        coreGrid.innerHTML = coreMembers
            .map((m, i) => createCard(m, "core", i))
            .join("");
    }
    if (subcoreGrid) {
        subcoreGrid.innerHTML = subcoreMembers
            .map((m, i) => createCard(m, "subcore", i + coreMembers.length))
            .join("");
    }

    /* ============================================================
       3D TILT EFFECT
       ============================================================ */
    document.querySelectorAll(".chip-card").forEach((card) => {
        const wrapper = card.querySelector(".processor-3d");
        if (!wrapper) return;
        let tiltRAF = null;

        card.addEventListener(
            "mousemove",
            (e) => {
                if (tiltRAF) return;
                tiltRAF = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -8;
                    const rotateY = ((x - centerX) / centerX) * 8;
                    wrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    tiltRAF = null;
                });
            },
            { passive: true },
        );

        card.addEventListener("mouseleave", () => {
            if (tiltRAF) {
                cancelAnimationFrame(tiltRAF);
                tiltRAF = null;
            }
            wrapper.style.transform = "rotateX(0) rotateY(0)";
            wrapper.style.transition = "transform 0.5s ease";
            setTimeout(() => {
                wrapper.style.transition = "transform 0.1s ease-out";
            }, 500);
        });

        card.addEventListener("mouseenter", () => {
            wrapper.style.transition = "transform 0.1s ease-out";
        });
    });

    /* ============================================================
       OVERLAY LOGIC
       ============================================================ */
    const overlay = document.getElementById("overlay");

    function openOverlay(member, type) {
        if (!overlay) return;
        document.getElementById("overlayPhoto").src = member.photo;
        document.getElementById("overlayName").textContent = member.name;
        document.getElementById("overlayPosition").textContent =
            member.position;
        document.getElementById("overlayBadge").textContent =
            type === "core" ? "// CORE PROCESSOR" : "// CO-PROCESSOR";
        document.getElementById("overlayBio").textContent = member.bio;
        document.getElementById("overlayStatus").textContent =
            `SYS.READY // ${member.model} // NODE.ACTIVE`;

        const sc = document.getElementById("overlaySocials");
        sc.innerHTML = "";
        const icons = {
            linkedin: "fab fa-linkedin-in",
            github: "fab fa-github",
            instagram: "fab fa-instagram",
            twitter: "fab fa-twitter",
        };
        if (member.socials) {
            for (const [p, url] of Object.entries(member.socials)) {
                const a = document.createElement("a");
                a.href = url;
                a.target = "_blank";
                a.rel = "noopener";
                a.innerHTML = `<i class="${icons[p] || "fas fa-link"}"></i>`;
                sc.appendChild(a);
            }
        }
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeOverlay() {
        if (!overlay) return;
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    }

    document.querySelectorAll(".chip-card").forEach((card) => {
        card.addEventListener("click", () => {
            openOverlay(JSON.parse(card.dataset.member), card.dataset.type);
        });
    });

    const overlayClose = document.getElementById("overlayClose");
    if (overlayClose) overlayClose.addEventListener("click", closeOverlay);

    const overlayBackdrop = document.getElementById("overlayBackdrop");
    if (overlayBackdrop) overlayBackdrop.addEventListener("click", closeOverlay);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeOverlay();
    });

    /* ============================================================
       SCROLL ANIMATIONS
       ============================================================ */
    const revObs = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) e.target.classList.add("visible");
            });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => revObs.observe(el));

    const cardObs = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.querySelectorAll(".chip-card").forEach((c, i) => {
                        setTimeout(() => c.classList.add("visible"), i * 120);
                    });
                    cardObs.unobserve(e.target);
                }
            });
        },
        { threshold: 0.05 },
    );
    document
        .querySelectorAll(".chip-grid")
        .forEach((g) => cardObs.observe(g));

    /* ============================================================
       DATA STREAM REFRESH
       ============================================================ */
    const dataStreams = document.querySelectorAll(".data-stream");
    setInterval(() => {
        if (document.hidden) return;
        dataStreams.forEach((el) => {
            el.textContent = generateDataStream();
        });
    }, 200);

})();

// Smooth Scrolling for Anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Logo Scroll Behavior
window.addEventListener('scroll', () => {
    const logoContainers = document.querySelectorAll('.logo-container');
    const scrollThreshold = 100; // Adjust as needed (e.g., hero height)

    if (window.scrollY > scrollThreshold) {
        logoContainers.forEach(container => {
            container.classList.add('logo-hidden');
        });
    } else {
        logoContainers.forEach(container => {
            container.classList.remove('logo-hidden');
        });
    }
});

// Cursor Glow Logic
document.addEventListener("mousemove", (e) => {
    const cursor = document.getElementById("cursorGlow");
    if (cursor) {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
        cursor.style.opacity = 1;
    }
});

// Creative Loader Logic
document.addEventListener("DOMContentLoaded", () => {
    const powerSwitch = document.getElementById("powerSwitch");
    const entryScreen = document.getElementById("entryScreen");
    const switchBoard = document.querySelector(".switch-board");
    const loader = document.getElementById("creativeLoader");

    // Initially light up RED led and ensure loader is hidden
    if (switchBoard) {
        const redLight = switchBoard.querySelector(".light.red");
        if (redLight) {
            redLight.style.background = "#f00";
            redLight.style.boxShadow = "0 0 10px #f00";
        }
    }

    // Ensure loader is hidden initially
    if (loader) {
        loader.style.display = "none";
        loader.style.opacity = "0";
    }

    if (powerSwitch) {
        powerSwitch.addEventListener("change", function () {
            if (this.checked) {
                // Power ON Sequence
                if (switchBoard) switchBoard.classList.add("powered-on");

                setTimeout(() => {
                    // Transition to Loader
                    if (entryScreen) {
                        entryScreen.style.opacity = "0";
                        // Start loader IMMEDIATELY as screen fades out
                        startCreativeLoader();

                        setTimeout(() => {
                            entryScreen.style.display = "none";
                        }, 500); // Wait for fade out
                    }
                }, 2000); // 2 seconds delay as requested
            }
        });
    } else {
        // Fallback if no switch found
        startCreativeLoader();
    }
});

function startCreativeLoader() {
    const loader = document.getElementById("creativeLoader");
    const loaderText = document.getElementById("loaderText");
    const bulbs = document.querySelectorAll(".bulb-group");

    if (!loader) return;

    // Show Loader
    loader.style.display = "flex";
    // Force reflow
    void loader.offsetWidth;
    loader.style.opacity = "1";

    // Text Typing Animation
    const text1 = "Plugging Into the World of IETE...";
    let textIndex = 0;

    function typeText(text, callback) {
        if (loaderText) loaderText.textContent = "";
        textIndex = 0;
        const interval = setInterval(() => {
            if (loaderText && textIndex < text.length) {
                loaderText.textContent += text.charAt(textIndex);
                textIndex++;
            } else {
                clearInterval(interval);
                if (callback) callback();
            }
        }, 50); // Typing speed
    }

    const dots = document.querySelectorAll(".node-dot");

    // Connection Sequence
    function connectDots() {
        // Precise Timing for Cyan Wave Sync
        // Wave Animation: 4s duration, 0.5s delay.
        // Path distance ~800 units.

        // Dot 1 (approx 25% of path): 0.5s + 1s = 1.5s
        setTimeout(() => {
            if (dots[0]) dots[0].classList.add("dot-on");
        }, 1500);

        // Dot 2 (approx 50% of path): 0.5s + 2s = 2.5s
        setTimeout(() => {
            if (dots[1]) dots[1].classList.add("dot-on");
        }, 2500);

        // Dot 3 (approx 75% of path): 0.5s + 3s = 3.5s
        setTimeout(() => {
            if (dots[2]) dots[2].classList.add("dot-on");
        }, 3500);

        // Final Node (100% of path): 0.5s + 4s = 4.5s
        setTimeout(() => {
            // Light up the last node (which is now the 4th dot if we count them all)
            // We can just query all dots again to be safe/lazy or use specific index
            const allDots = document.querySelectorAll(".node-dot");
            if (allDots[3]) allDots[3].classList.add("dot-on");

            // Optional: Trigger something else? Text fade in? 
            // For now, just the node glow is sufficient termination.
        }, 4500);
    }

    // Sequence Controller
    setTimeout(() => {
        typeText(text1, () => {
            connectDots();
        });
    }, 500); // Start typing after wire starts drawing

    // Finish Loading
    setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => {
            loader.style.display = "none";
        }, 1500);
    }, 9000); // Allow bulb to glow for ~5 seconds before fading
    /* =========================================
       RENAISSANCE BHARADWAJ / PAST EVENTS LOGIC
       ========================================= */
    document.addEventListener('DOMContentLoaded', () => {
        const discWrapper = document.querySelector('.disc-wrapper');
        if (!discWrapper) return; // Exit if not found

        const items = document.querySelectorAll('.event-item');
        const infoBox = document.getElementById('info-box');
        const titleEl = document.getElementById('event-title');
        const dateEl = document.getElementById('event-date');
        const descEl = document.getElementById('event-desc');

        // Radius calculation
        // Use fixed logic or relative to wrapper
        const currentSize = discWrapper.offsetWidth || 800; // Fallback
        const radius = (currentSize / 2) * 0.80;

        // Distribute items
        const totalItems = items.length;
        const angleStep = 360 / totalItems;

        items.forEach((item, index) => {
            const angle = index * angleStep;
            const angleRad = angle * (Math.PI / 180);
            const x = radius * Math.cos(angleRad);
            const y = radius * Math.sin(angleRad);

            // Position using margin offsets from center
            item.style.left = `calc(50% + ${x}px)`;
            item.style.top = `calc(50% + ${y}px)`;
        });

        // Interaction Logic
        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                discWrapper.classList.add('paused');

                // Show Info
                const title = item.getAttribute('data-title');
                const date = item.getAttribute('data-date');
                const desc = item.getAttribute('data-desc');

                if (titleEl) titleEl.textContent = title;
                if (dateEl) dateEl.textContent = date;
                if (descEl) descEl.textContent = desc;

                if (infoBox) infoBox.classList.add('active');
            });

            item.addEventListener('mouseleave', () => {
                discWrapper.classList.remove('paused');
                if (infoBox) infoBox.classList.remove('active');
            });
        });

        // Renaissance Text Interactivity
        const renaissanceWords = document.querySelectorAll('.renaissance-word');
        renaissanceWords.forEach(word => {
            word.addEventListener('mouseenter', () => {
                discWrapper.classList.add('paused');
                if (infoBox) {
                    infoBox.classList.add('renaissance-theme');
                    const title = word.getAttribute('data-title');
                    const date = word.getAttribute('data-date');
                    const desc = word.getAttribute('data-desc');

                    if (titleEl) titleEl.textContent = title;
                    if (dateEl) dateEl.textContent = date;
                    if (descEl) descEl.textContent = desc;

                    infoBox.classList.add('active');
                }
            });

            word.addEventListener('mouseleave', () => {
                discWrapper.classList.remove('paused');
                if (infoBox) {
                    infoBox.classList.remove('active');
                    setTimeout(() => {
                        if (!infoBox.classList.contains('active')) {
                            infoBox.classList.remove('renaissance-theme');
                        }
                    }, 300);
                }
            });
        });
    });
}
