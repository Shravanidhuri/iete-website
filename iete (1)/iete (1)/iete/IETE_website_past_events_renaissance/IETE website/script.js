document.addEventListener('DOMContentLoaded', () => {
    const discWrapper = document.querySelector('.disc-wrapper');
    const items = document.querySelectorAll('.event-item');
    const infoBox = document.getElementById('info-box');

    // Info Box Elements
    const titleEl = document.getElementById('event-title');
    const dateEl = document.getElementById('event-date');
    const descEl = document.getElementById('event-desc');

    // Radius of the circle on which items are placed
    // We want them slightly inside the edge.
    // Calculate radius dynamically based on current disc size
    let wrapperRect = discWrapper.getBoundingClientRect();
    // Since wrapper might be scaled or positioned, use offsetWidth if possible or fallback
    let currentSize = discWrapper.offsetWidth;
    // Radius should be slightly closer to edge. 
    // Disc radius is currentSize / 2.
    // User wants icons at 200px with placement like before.
    // Using 0.85 for slightly more distance from the disc.
    const radius = (currentSize / 2) * 0.80;

    // Distribute items in a circle
    const totalItems = items.length;
    const angleStep = 360 / totalItems;

    items.forEach((item, index) => {
        const angle = index * angleStep;
        // Convert to radians
        const angleRad = angle * (Math.PI / 180);

        // Calculate x, y
        // Center is 0,0 relative to the wrapper center (50% 50%)
        // x = r * cos(theta), y = r * sin(theta)
        const x = radius * Math.cos(angleRad);
        const y = radius * Math.sin(angleRad);

        // Apply translation
        // Items are already centered by CSS (top:50%, left:50%, margin-top:-30px etc)
        // so we just add the transform translate

        // We set a CSS variable or direct style for the base position
        // But since we want them to "orbit", and the wrapper is spinning,
        // we just fit them onto the wrapper.
        // Wait, if we attach them to the wrapper, they spin with it.
        // That is what we want.

        item.style.transform = `translate(${x}px, ${y}px)`;

        // However, the CSS hover scale effect uses transform. 
        // We shouldn't overwrite it. 
        // Better to set left/top percentages or margins if we want to avoid transform conflicts,
        // OR wrap the content.
        // Actually, let's use margin offsets to position base, and transform for hover/counter-rotate.
        // Easier:
        // Reset top/left to 50% in CSS, then:
        item.style.left = `calc(50% + ${x}px)`;
        item.style.top = `calc(50% + ${y}px)`;
        item.style.transform = ''; // Clear default transform if any

        // Set initial counter-rotation delay so they all face up relative to the spin
        // The wrapper spin is linear 20s. 
        // We need the items to have `animation-delay` corresponding to their position if needed?
        // Actually, if they all start at 0deg rotation and spin -360deg, they stay upright relative to the screen
        // provided the wrapper spins +360deg.
        // The static position is just the anchor point on the disc.
    });

    // Interaction Logic
    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Stop rotation
            discWrapper.classList.add('paused');

            // Get current position of the item relative to the viewport
            // We need to determine if it's left, right, or top (relative to disc center)
            const rect = item.getBoundingClientRect();
            const discRect = discWrapper.getBoundingClientRect();
            const centerX = discRect.left + discRect.width / 2;
            const centerY = discRect.top + discRect.height / 2;
            const itemX = rect.left + rect.width / 2;
            const itemY = rect.top + rect.height / 2;

            const deltaX = itemX - centerX;
            const deltaY = itemY - centerY;

            // Remove old classes
            infoBox.classList.remove('left', 'right', 'top');

            // Thresholds for positioning - REMOVED, always show at top
            // remove old classes just in case
            infoBox.classList.remove('left', 'right');

            // The position is now fixed in CSS to the top of the screen
            // infoBox.classList.add('top'); 
            // Reset any inline styles
            infoBox.style.left = '';
            infoBox.style.top = '';

            // Show Info
            const title = item.getAttribute('data-title');
            const date = item.getAttribute('data-date');
            const desc = item.getAttribute('data-desc');

            titleEl.textContent = title;
            dateEl.textContent = date;
            descEl.textContent = desc;

            infoBox.classList.add('active');
        });

        item.addEventListener('mouseleave', () => {
            // Resume rotation
            discWrapper.classList.remove('paused');

            // Hide info
            infoBox.classList.remove('active');
        });
    });

    // Renaissance Text Interactivity
    const renaissanceWords = document.querySelectorAll('.renaissance-word');
    renaissanceWords.forEach(word => {
        word.addEventListener('mouseenter', () => {
            discWrapper.classList.add('paused');
            infoBox.classList.add('renaissance-theme');

            const title = word.getAttribute('data-title');
            const date = word.getAttribute('data-date');
            const desc = word.getAttribute('data-desc');

            titleEl.textContent = title;
            dateEl.textContent = date;
            descEl.textContent = desc;

            infoBox.classList.add('active');
        });

        word.addEventListener('mouseleave', () => {
            discWrapper.classList.remove('paused');
            infoBox.classList.remove('active');
            // Delay removal of theme slightly for smooth transition if needed, or just remove
            setTimeout(() => {
                if (!infoBox.classList.contains('active')) {
                    infoBox.classList.remove('renaissance-theme');
                }
            }, 300);
        });
    });
});
