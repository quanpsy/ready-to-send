/* ============================================
   carousel.js - Netflix-Style Carousel
   ============================================
   
   🎠 SEAMLESS NETFLIX-STYLE SCROLL
   
   Features:
   - Invisible nav zones that blend with fade
   - Arrow only appears on hover
   - Left zone hidden until scrolled
   - Smooth scroll animation
   
   ============================================ */


/**
 * Create a category section with Netflix-style carousel
 */
function createCategoryCarousel(category, items) {

    if (!items || items.length === 0) return null;

    // Create section container
    const section = document.createElement('div');
    section.className = 'project-category';
    section.id = `category-${category.id}`;

    // Build HTML with invisible nav zones
    section.innerHTML = `
        <!-- CATEGORY HEADER -->
        <div class="category-header">
            <h2 class="category-title">${category.title}</h2>
        </div>
        
        <!-- CAROUSEL WITH NETFLIX NAV ZONES -->
        <div class="carousel-wrapper">
            <!-- Left Nav Zone (hidden at start, blends with fade) -->
            <button class="carousel-nav-zone prev" data-category="${category.id}" aria-label="Scroll left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            
            <!-- Carousel Track -->
            <div class="project-carousel" data-category="${category.id}">
                ${items.map(item => createProjectCardV2(item)).join('')}
            </div>
            
            <!-- Right Nav Zone (blends with fade) -->
            <button class="carousel-nav-zone next" data-category="${category.id}" aria-label="Scroll right">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
        </div>
    `;

    // Get elements
    const prevZone = section.querySelector('.carousel-nav-zone.prev');
    const nextZone = section.querySelector('.carousel-nav-zone.next');
    const carousel = section.querySelector('.project-carousel');
    const wrapper = section.querySelector('.carousel-wrapper');

    // Add click handlers
    prevZone.addEventListener('click', (e) => {
        e.stopPropagation();
        scrollCarousel(carousel, 'prev');
    });

    nextZone.addEventListener('click', (e) => {
        e.stopPropagation();
        scrollCarousel(carousel, 'next');
    });

    // Add scroll listener to update state
    carousel.addEventListener('scroll', () => {
        updateCarouselState(carousel, wrapper, prevZone, nextZone);
    });

    // Initial state check
    setTimeout(() => {
        updateCarouselState(carousel, wrapper, prevZone, nextZone);
    }, 100);

    return section;
}


/**
 * Update carousel UI state based on scroll position
 */
function updateCarouselState(carousel, wrapper, prevZone, nextZone) {
    const scrollLeft = carousel.scrollLeft;
    const scrollWidth = carousel.scrollWidth;
    const clientWidth = carousel.clientWidth;

    // Show left zone and add scrolled class if not at start
    if (scrollLeft > 5) {
        wrapper.classList.add('scrolled');
    } else {
        wrapper.classList.remove('scrolled');
    }

    // Hide right zone if at end
    if (scrollLeft + clientWidth >= scrollWidth - 5) {
        nextZone.classList.add('at-end');
    } else {
        nextZone.classList.remove('at-end');
    }
}


/**
 * Scroll carousel smoothly (Netflix-style)
 */
function scrollCarousel(carousel, direction) {
    if (!carousel) return;

    const card = carousel.querySelector('.project-card, .project-card-v2, .project-card-v3');
    if (!card) return;

    const cardWidth = card.offsetWidth;
    const gap = 20;

    // Calculate scroll amount based on visible area
    const visibleWidth = carousel.clientWidth;
    const cardWithGap = cardWidth + gap;

    // Scroll by most of the visible area (feels smooth like Netflix)
    const cardsToScroll = Math.max(1, Math.floor((visibleWidth - 80) / cardWithGap));
    const scrollAmount = cardWithGap * cardsToScroll;

    if (direction === 'next') {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    } else {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
}


/**
 * Initialize all carousels - touch/drag support
 */
function initCarousels() {
    const carousels = document.querySelectorAll('.project-carousel');

    carousels.forEach(carousel => {
        let isDown = false;
        let startX;
        let scrollLeft;
        let hasMoved = false;

        // Mouse drag support
        carousel.addEventListener('mousedown', (e) => {
            // Don't start drag if clicking on a card button
            if (e.target.closest('button, a')) return;

            isDown = true;
            hasMoved = false;
            carousel.style.cursor = 'grabbing';
            carousel.style.scrollBehavior = 'auto'; // Disable smooth scroll during drag
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });

        carousel.addEventListener('mouseleave', () => {
            if (isDown) {
                isDown = false;
                carousel.style.cursor = 'grab';
                carousel.style.scrollBehavior = 'smooth';
            }
        });

        carousel.addEventListener('mouseup', () => {
            isDown = false;
            carousel.style.cursor = 'grab';
            carousel.style.scrollBehavior = 'smooth';
        });

        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;

            const x = e.pageX - carousel.offsetLeft;
            const walk = x - startX;

            // Only register as moved if significant movement
            if (Math.abs(walk) > 5) {
                hasMoved = true;
                e.preventDefault();
                carousel.scrollLeft = scrollLeft - walk;
            }
        });

        // Prevent click after drag
        carousel.addEventListener('click', (e) => {
            if (hasMoved) {
                e.preventDefault();
                e.stopPropagation();
                hasMoved = false;
            }
        }, true);

        // Touch support
        let touchStartX = 0;
        let touchScrollLeft = 0;

        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].pageX;
            touchScrollLeft = carousel.scrollLeft;
            carousel.style.scrollBehavior = 'auto';
        }, { passive: true });

        carousel.addEventListener('touchmove', (e) => {
            const touchX = e.touches[0].pageX;
            const walk = touchStartX - touchX;
            carousel.scrollLeft = touchScrollLeft + walk;
        }, { passive: true });

        carousel.addEventListener('touchend', () => {
            carousel.style.scrollBehavior = 'smooth';
        }, { passive: true });
    });
}


// Make functions available globally
window.createCategoryCarousel = createCategoryCarousel;
window.scrollCarousel = scrollCarousel;
window.initCarousels = initCarousels;
