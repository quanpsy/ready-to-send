/* ============================================
   home.js - Home Page Script
   ============================================
   
   📄 HOME PAGE INITIALIZATION
   
   This script runs on the home page (index.html).
   It handles:
   - Scroll animations
   - Parallax effects
   - Button ripple effects
   
   ============================================ */


let homePageInitialized = false;

/**
 * Initialize the home page
 */
function initHomePage() {
    // Prevent re-initialization
    if (homePageInitialized) {
        console.log('[Home] Already initialized, skipping');
        return;
    }
    homePageInitialized = true;

    // NOTE: Nav and footer are now rendered by Router

    // Initialize effects
    initScrollAnimations();
    initParallax();
    initButtonRipples();
    initMouseGlow();

    // Initialize special sections (term rows + logo loop)
    if (typeof initHomeSections === 'function') {
        initHomeSections();
    }

    // Console easter egg
    console.log('%c🚀 divisionzero', 'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
    console.log('%cInterested in joining? Reach out to us!', 'font-size: 14px; color: #a78bfa;');
}


/**
 * Initialize scroll-triggered animations
 * Fades in sections as they enter viewport
 * SCOPED: Only applies to HOME page sections
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // ONLY observe HOME page sections (not other pages)
    document.querySelectorAll('#page-home .section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
}


/**
 * Initialize parallax scrolling effect
 */
function initParallax() {
    // Only on desktop
    if (window.innerWidth <= 768) return;

    const heroBackground = document.querySelector('.hero-bg');
    const parallaxElements = document.querySelectorAll('.parallax-bg');

    window.addEventListener('scroll', utils.throttle(() => {
        const scrolled = window.scrollY;

        // Hero background parallax
        if (heroBackground) {
            const offset = scrolled * 0.5;
            heroBackground.style.transform = `translateY(${offset}px)`;
        }

        // Other parallax elements
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }, 16)); // ~60fps
}


/**
 * Initialize button ripple effects
 */
function initButtonRipples() {
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
        button.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            const ripple = document.createElement('span');
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}


/**
 * Initialize mouse glow effect on cards
 */
function initMouseGlow() {
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.feature-card, .model-card');

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}


// NOTE: initHomePage is called by Router when navigating to home page
// DO NOT add DOMContentLoaded listener here - Router handles page initialization
window.initHomePage = initHomePage;
