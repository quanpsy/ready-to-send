/* ============================================
   mobile-spotlight.js - Mobile Hover Simulator
   ============================================
   
   📱 MOBILE SPOTLIGHT SYSTEM v3
   
   Rules:
   - Invisible 1rem (16px) diameter spotlight
   - Vertical scroll: spotlight at screen center
   - Carousel scroll: spotlight at carousel's vertical center
   - Spotlight disabled when user PRESSES something
   - Spotlight re-enables when user SCROLLS again
   - Only ONE spotlight active at a time
   - NOT active on submit page
   
   ============================================ */


const MobileSpotlight = {

    // Elements that respond to spotlight
    spotlightSelectors: [
        '.project-card-v2',
        '.project-card',
        '.term-card',
        '.tool-card',
        '.tile',
        '.feature-card',
        '.model-card',
        '.glass',
        '.hero-external-link',
        '.btn-primary',
        '.btn-secondary'
    ],

    // Class added when in spotlight
    spotlightClass: 'spotlight-hover',

    // State
    currentSpotlighted: new Set(),
    activeCarousel: null,
    scrollMode: 'vertical',
    spotlightRadius: 8, // 1rem diameter = 16px, radius = 8px
    spotlightEnabled: true, // Disabled on press, enabled on scroll


    /**
     * Initialize
     */
    init() {
        // Skip non-touch devices
        if (!this.isTouchDevice()) return;

        // Skip submit page
        if (window.location.pathname.includes('submit')) {
            console.log('📱 Spotlight: disabled on submit page');
            return;
        }

        console.log('📱 Spotlight v3: initialized');

        // Find all carousels
        this.carousels = document.querySelectorAll('.carousel-track');

        this.addListeners();
        this.updateSpotlight();
    },


    /**
     * Check if touch device
     */
    isTouchDevice() {
        return ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (window.innerWidth <= 768);
    },


    /**
     * Add event listeners
     */
    addListeners() {
        // === PRESS DETECTION - Disable spotlight ===
        document.addEventListener('touchstart', (e) => {
            // Check if touching an interactive element
            const target = e.target.closest('a, button, .project-card-v2, .tool-card, .term-card');
            if (target) {
                this.spotlightEnabled = false;
                this.clearAllSpotlights();
            }
        }, { passive: true });

        // === VERTICAL SCROLL - Enable spotlight ===
        window.addEventListener('scroll', () => {
            this.spotlightEnabled = true;
            this.scrollMode = 'vertical';
            this.activeCarousel = null;
            this.updateSpotlight();
        }, { passive: true });

        // === CAROUSEL SCROLL - Enable and focus on that carousel ===
        this.carousels.forEach(carousel => {
            carousel.addEventListener('scroll', () => {
                this.spotlightEnabled = true;
                this.scrollMode = 'horizontal';
                this.activeCarousel = carousel;
                this.updateSpotlight();
            }, { passive: true });
        });

        // === TOUCH MOVE - Update while scrolling ===
        document.addEventListener('touchmove', () => {
            if (this.spotlightEnabled) {
                this.updateSpotlight();
            }
        }, { passive: true });
    },


    /**
     * Clear all spotlights
     */
    clearAllSpotlights() {
        this.currentSpotlighted.forEach(el => {
            el.classList.remove(this.spotlightClass);
        });
        this.currentSpotlighted.clear();
    },


    /**
     * Get spotlight position based on mode
     */
    getSpotlightPosition() {
        const centerX = window.innerWidth / 2;

        if (this.scrollMode === 'horizontal' && this.activeCarousel) {
            // Carousel mode: X = screen center, Y = carousel's vertical center
            const carouselRect = this.activeCarousel.getBoundingClientRect();
            const carouselCenterY = carouselRect.top + carouselRect.height / 2;
            return { x: centerX, y: carouselCenterY };
        } else {
            // Vertical mode: X = screen center, Y = screen center
            const centerY = window.innerHeight / 2;
            return { x: centerX, y: centerY };
        }
    },


    /**
     * Update spotlight - check elements
     */
    updateSpotlight() {
        // Don't update if disabled
        if (!this.spotlightEnabled) return;

        const spotlight = this.getSpotlightPosition();
        const radius = this.spotlightRadius;

        // Determine which elements to check
        let elements;
        if (this.scrollMode === 'horizontal' && this.activeCarousel) {
            // Only check elements in active carousel
            elements = this.activeCarousel.querySelectorAll(this.spotlightSelectors.join(','));

            // Clear spotlight from elements NOT in active carousel
            this.currentSpotlighted.forEach(el => {
                if (!this.activeCarousel.contains(el)) {
                    el.classList.remove(this.spotlightClass);
                    this.currentSpotlighted.delete(el);
                }
            });
        } else {
            // Check all page elements
            elements = document.querySelectorAll(this.spotlightSelectors.join(','));
        }

        // Check each element
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();

            // Skip off-screen elements
            if (rect.bottom < 0 || rect.top > window.innerHeight) {
                if (this.currentSpotlighted.has(el)) {
                    el.classList.remove(this.spotlightClass);
                    this.currentSpotlighted.delete(el);
                }
                return;
            }

            const elCenterX = rect.left + rect.width / 2;
            const elCenterY = rect.top + rect.height / 2;

            // Distance from spotlight center to element center
            const distance = Math.sqrt(
                Math.pow(elCenterX - spotlight.x, 2) +
                Math.pow(elCenterY - spotlight.y, 2)
            );

            // Element is in spotlight if overlap exists
            const elRadius = Math.max(rect.width, rect.height) / 2;
            const inSpotlight = distance < (elRadius + radius);

            // Apply or remove class
            if (inSpotlight) {
                if (!this.currentSpotlighted.has(el)) {
                    el.classList.add(this.spotlightClass);
                    this.currentSpotlighted.add(el);
                }
            } else {
                if (this.currentSpotlighted.has(el)) {
                    el.classList.remove(this.spotlightClass);
                    this.currentSpotlighted.delete(el);
                }
            }
        });
    },


    /**
     * Refresh after DOM changes
     */
    refresh() {
        this.carousels = document.querySelectorAll('.carousel-track');
        this.updateSpotlight();
    }
};


// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    MobileSpotlight.init();
});

// Refresh after load
window.addEventListener('load', () => {
    setTimeout(() => MobileSpotlight.refresh(), 500);
});

// Global access
window.MobileSpotlight = MobileSpotlight;
