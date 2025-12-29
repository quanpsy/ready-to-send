/* ============================================
   nav.js - Navigation Component
   ============================================
   
   🧭 RENDERS THE NAVIGATION BAR
   
   This component:
   - Renders the nav with logo and links
   - Handles mobile hamburger menu
   - Highlights active page
   
   TO USE:
   Add <div id="nav-placeholder" data-page="home"></div>
   to your HTML, and this script will replace it.
   
   TO EDIT LINKS:
   Go to config.js and edit NAV_LINKS array.
   
   ============================================ */


/**
 * Render the navigation component
 * 
 * @param {string} activePage - The current page ID (home, projects, etc.)
 */
function renderNavigation(activePage = 'home') {

    // ========================================
    // Navigation HTML Template
    // ----------------------------------------
    // Edit this to change nav structure
    // ========================================

    const navHTML = `
        <nav class="nav">
            <div class="container nav-container">
                
                <!-- LOGO -->
                <a href="/" class="logo-link">
                    <img src="assets/images/white-name.svg" 
                         alt="${CONFIG.SITE_NAME}" 
                         class="logo-nav">
                </a>
                
                <!-- INVISIBLE SCROLL-TO-TOP TOUCH AREA (Mobile only) -->
                <div class="mobile-scroll-top" id="mobile-scroll-top" aria-label="Scroll to top"></div>
                
                <!-- NAVIGATION LINKS -->
                <div class="nav-links" id="nav-links">
                    ${CONFIG.NAV_LINKS.map(link => `
                        <a href="${link.href}" 
                           class="nav-link ${activePage === link.id ? 'active' : ''}">
                            ${link.name}
                        </a>
                    `).join('')}
                    
                    <!-- JOIN US BUTTON -->
                    <a href="${CONFIG.DISCORD_URL}" 
                       class="nav-btn-join" 
                       target="_blank" 
                       rel="noopener noreferrer">
                        Join Us
                    </a>
                </div>
                
                <!-- HAMBURGER MENU (Mobile) -->
                <button class="hamburger" id="hamburger" aria-label="Toggle menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                
            </div>
        </nav>
    `;

    // Insert nav into placeholder
    const placeholder = document.getElementById('nav-placeholder');
    if (placeholder) {
        placeholder.outerHTML = navHTML;

        // Initialize mobile menu after inserting
        initMobileMenu();
    }
}


/**
 * Initialize mobile hamburger menu functionality
 */
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const mobileScrollTop = document.getElementById('mobile-scroll-top');

    if (!hamburger || !navLinks) return;

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });

    // Close menu when clicking a link
    const links = navLinks.querySelectorAll('.nav-link, .nav-btn-join');
    links.forEach(link => {
        link.addEventListener('click', function () {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
        const isClickInside = hamburger.contains(event.target) ||
            navLinks.contains(event.target);

        if (!isClickInside && navLinks.classList.contains('active')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    // Mobile scroll-to-top on invisible header touch area
    if (mobileScrollTop) {
        mobileScrollTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Reset scroll position for current page only
            if (window.Router && window.Router.currentPage) {
                window.Router.scrollPositions[window.Router.currentPage] = 0;
            }
        });
    }
}


// Make function available globally
window.renderNavigation = renderNavigation;
