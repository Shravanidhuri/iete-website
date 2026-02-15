document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.chip-card');
    const turbulence = document.querySelector('#electric-spark-filter feTurbulence');

    // --- Sequential Edge Sequence Configuration ---
    const EDGE_DURATION = 0.4;   // Time for one straight edge
    const CORNER_DURATION = 0.1; // Time for one corner arc
    const CARD_Total = (EDGE_DURATION + CORNER_DURATION) * 4;
    const ROW_TOTAL_TIME = CARD_Total * 3; // 3 cards per row

    // Group cards into rows
    const cardArray = Array.from(cards);
    const rows = [
        cardArray.slice(0, 3), // Top Row
        cardArray.slice(3, 6)  // Bottom Row
    ];

    rows.forEach(row => {
        let globalDelay = 0;

        row.forEach(card => {
            // Create SVG container
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.classList.add('spark-svg');

            const { width, height } = card.getBoundingClientRect();
            const r = 15; // Border radius
            const w = width;
            const h = height;

            // 1. Base Circuit (Dim Background)
            const baseRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            baseRect.classList.add('circuit-base');
            baseRect.setAttribute('x', '1');
            baseRect.setAttribute('y', '1');
            baseRect.setAttribute('width', w - 2);
            baseRect.setAttribute('height', h - 2);
            baseRect.setAttribute('rx', r);
            baseRect.setAttribute('ry', r);
            svg.appendChild(baseRect);

            // Helper to create Animated Segment
            const createSegment = (pathData, duration, type) => {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute('d', pathData);

                if (type === 'edge') {
                    path.classList.add('spark-edge');
                    path.style.animation = `draw-line ${ROW_TOTAL_TIME}s linear infinite`;
                    // Calculate length for dashoffset
                    const len = (pathData.includes('H') || pathData.includes('V'))
                        ? (type === 'edge' ? 1000 : 100) // Fallback, but we use precise calculation below
                        : 50;

                    // We need real length for draw-line animation
                    // For straight lines:
                    // Top: w - 2r
                    // Vertical: h - 2r
                    let segmentLength = 0;
                    if (pathData.includes(`H ${w - r}`)) segmentLength = (w - r) - r;
                    else if (pathData.includes(`V ${h - r}`)) segmentLength = (h - r) - r;
                    else if (pathData.includes(`H ${r}`)) segmentLength = (w - r) - r;
                    else if (pathData.includes(`V ${r}`)) segmentLength = (h - r) - r;

                    path.style.setProperty('--length', segmentLength + 20); // +20 buffer
                    path.style.strokeDasharray = segmentLength + 20;
                } else {
                    path.classList.add('spark-corner');
                    path.style.animation = `corner-flash ${ROW_TOTAL_TIME}s linear infinite`;
                }

                path.style.animationDelay = `${globalDelay}s`;
                svg.appendChild(path);
                globalDelay += duration;
            };

            // Defines coordinates for inner stroke (1px offset)
            // Top Edge: (r, 1) -> (w-r, 1)
            createSegment(`M ${r} 1 H ${w - r}`, EDGE_DURATION, 'edge');

            // TR Corner: (w-r, 1) -> (w-1, r)
            createSegment(`M ${w - r} 1 Q ${w - 1} 1 ${w - 1} r`, CORNER_DURATION, 'corner');

            // Right Edge: (w-1, r) -> (w-1, h-r)
            createSegment(`M ${w - 1} r V ${h - r}`, EDGE_DURATION, 'edge');

            // BR Corner: (w-1, h-r) -> (w-r, h-1)
            createSegment(`M ${w - 1} h-r Q ${w - 1} ${h - 1} ${w - r} ${h - 1}`.replace('h-r', h - r).replace('h-1', h - 1).replace('h-1', h - 1), CORNER_DURATION, 'corner');

            // Bottom Edge: (w-r, h-1) -> (r, h-1) 
            createSegment(`M ${w - r} ${h - 1} H ${r}`, EDGE_DURATION, 'edge');

            // BL Corner: (r, h-1) -> (1, h-r)
            createSegment(`M ${r} ${h - 1} Q 1 ${h - 1} 1 ${h - r}`, CORNER_DURATION, 'corner');

            // Left Edge: (1, h-r) -> (1, r)
            createSegment(`M 1 ${h - r} V ${r}`, EDGE_DURATION, 'edge');

            // TL Corner: (1, r) -> (r, 1)
            createSegment(`M 1 r Q 1 1 ${r} 1`, CORNER_DURATION, 'corner');

            // Append new SVG
            const borderContainer = card.querySelector('.card-border');
            if (borderContainer) {
                borderContainer.innerHTML = '';
                borderContainer.appendChild(svg);
            }
        });
    });

    // Global Filter Animation Loop (Gentle Noise)
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


    // --- Futuristic Circuit Board Animation (Ambient Mode) ---
    class CircuitBoard {
        constructor() {
            this.canvas = document.getElementById('circuit-board');
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d');
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.nodes = [];
            this.paths = [];
            this.packets = [];
            this.gridSize = 50; // Smaller grid for higher density

            this.init();
        }

        init() {
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.animate();
        }

        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.createCircuit();
        }

        createCircuit() {
            this.nodes = [];
            this.paths = [];
            this.packets = [];

            const cols = Math.ceil(this.width / this.gridSize);
            const rows = Math.ceil(this.height / this.gridSize);

            // 1. Generate Nodes (Higher density at edges)
            for (let x = 0; x <= cols; x++) {
                for (let y = 0; y <= rows; y++) {
                    let prob = 0.15; // Base probability
                    const cx = x / cols;
                    const cy = y / rows;
                    const distFromCenter = Math.sqrt(Math.pow(cx - 0.5, 2) + Math.pow(cy - 0.5, 2));

                    if (distFromCenter > 0.35) prob = 0.5; // Dense Edges

                    // Top area density for "header" feel
                    if (y < 3) prob = 0.4;

                    if (Math.random() < prob) {
                        this.nodes.push({
                            x: x * this.gridSize,
                            y: y * this.gridSize,
                            connections: [],
                            pulse: Math.random() * Math.PI * 2
                        });
                    }
                }
            }

            // 2. Generate Paths
            this.nodes.forEach(node => {
                this.nodes.forEach(other => {
                    if (node === other) return;
                    const dx = Math.abs(node.x - other.x);
                    const dy = Math.abs(node.y - other.y);
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Connect orthogonal neighbors or close diagonals
                    if (dist <= this.gridSize * 1.5 && node.connections.length < 3 && other.connections.length < 3) {
                        if (!node.connections.includes(other)) {
                            // Prefer orthogonal connections for "circuit" look
                            if ((dx === 0 || dy === 0) || Math.random() > 0.8) {
                                this.paths.push({ start: node, end: other });
                                node.connections.push(other);
                                other.connections.push(node);
                            }
                        }
                    }
                });
            });

            // 3. Initial Packets
            for (let i = 0; i < 8; i++) { // Fewer packets for "ambient" feel
                this.spawnPacket();
            }
        }

        spawnPacket() {
            if (this.paths.length === 0) return;
            const path = this.paths[Math.floor(Math.random() * this.paths.length)];
            const forward = Math.random() > 0.5;
            this.packets.push({
                x: forward ? path.start.x : path.end.x,
                y: forward ? path.start.y : path.end.y,
                targetX: forward ? path.end.x : path.start.x,
                targetY: forward ? path.end.y : path.start.y,
                speed: 0.2 + Math.random() * 0.3, // VERY Slow speed (0.2 - 0.5)
                path: path,
                life: 1.0
            });
        }

        animate() {
            this.ctx.clearRect(0, 0, this.width, this.height);

            // 1. Draw Static Traces (Dark & Subtle)
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)'; // Very faint cyan
            this.ctx.beginPath();
            this.paths.forEach(p => {
                this.ctx.moveTo(p.start.x, p.start.y);
                this.ctx.lineTo(p.end.x, p.end.y);
            });
            this.ctx.stroke();

            // 2. Draw Nodes (Subtle Pulse)
            this.nodes.forEach(n => {
                n.pulse += 0.02;
                const opacity = 0.05 + (Math.sin(n.pulse) + 1) * 0.1; // 0.05 to 0.25 opacity

                this.ctx.fillStyle = `rgba(0, 240, 255, ${opacity})`;
                this.ctx.beginPath();
                this.ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
                this.ctx.fill();
            });

            // 3. Draw Data Packets (Glowing but Slow)
            this.ctx.shadowBlur = 4;
            this.ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
            this.ctx.fillStyle = '#FFFFFF'; // White core

            for (let i = this.packets.length - 1; i >= 0; i--) {
                const p = this.packets[i];
                const dx = p.targetX - p.x;
                const dy = p.targetY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < p.speed) {
                    this.packets.splice(i, 1);
                    this.spawnPacket();
                } else {
                    const angle = Math.atan2(dy, dx);
                    p.x += Math.cos(angle) * p.speed;
                    p.y += Math.sin(angle) * p.speed;

                    // Draw packet
                    this.ctx.globalAlpha = Math.random() * 0.5 + 0.5; // Slight flicker
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.globalAlpha = 1.0;
                }
            }
            this.ctx.shadowBlur = 0;

            requestAnimationFrame(() => this.animate());
        }
    }

    // Initialize Circuit Board
    new CircuitBoard();
});
