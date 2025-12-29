/* ============================================
   router.js - SPA Router for Division Zero
   ============================================
   
   Handles client-side navigation without page reloads.
   Pages are sections in the DOM, shown/hidden based on route.
   
   Now also handles:
   - Nav rendering (once)
   - Footer rendering (once)
   - Correct nav active state on any route
   
   ============================================ */

const Router = {
    routes: {
        '': 'home',
        'home': 'home',
        'projects': 'projects',
        'tools': 'tools',
        'dictionary': 'dictionary',
        'submit': 'submit'
    },

    currentPage: null,
    navRendered: false,
    scrollPositions: {},  // Remember scroll position per page

    init() {
        // Render nav and footer FIRST (only once)
        this.renderGlobalComponents();

        // Handle initial route
        this.handleRoute();

        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => this.handleRoute());

        // Intercept all internal links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            // Skip external links and anchors
            if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
                return;
            }

            // Handle internal navigation
            e.preventDefault();
            const page = href.replace(/^\//, '').replace('.html', '') || 'home';
            this.navigate(page);
        });

        console.log('[Router] Initialized');
    },

    renderGlobalComponents() {
        // Get current page from URL for correct nav state
        let path = window.location.pathname.replace(/^\//, '').replace('.html', '');
        let currentPage = this.routes[path] || 'home';

        // Render nav with correct active page
        const navPlaceholder = document.getElementById('nav-placeholder');
        if (navPlaceholder && typeof renderNavigation === 'function') {
            renderNavigation(currentPage);
            this.navRendered = true;
            console.log('[Router] Nav rendered for:', currentPage);
        }

        // Render footer
        if (typeof renderFooter === 'function') {
            renderFooter();
        }
    },

    navigate(page) {
        // If clicking same page, smooth scroll to top instead
        if (page === this.currentPage) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.scrollPositions[page] = 0;  // Reset saved position
            return;
        }

        // Update URL without reload
        const url = page === 'home' ? '/' : '/' + page;
        history.pushState({ page }, '', url);

        // Show the page
        this.showPage(page);
    },

    handleRoute() {
        let path = window.location.pathname.replace(/^\//, '').replace('.html', '');
        let page = this.routes[path] || 'home';
        this.showPage(page);
    },

    showPage(page) {
        // Save scroll position of current page before leaving
        if (this.currentPage) {
            this.scrollPositions[this.currentPage] = window.scrollY;
        }

        // Hide all pages
        document.querySelectorAll('.spa-page').forEach(p => {
            p.classList.remove('active');
            p.style.display = 'none';
        });

        // Show target page
        const targetPage = document.getElementById('page-' + page);
        if (targetPage) {
            targetPage.classList.add('active');
            targetPage.style.display = 'block';

            // Mark as animated after animation completes (session memory)
            // This prevents animation from replaying on subsequent visits
            if (page !== 'home' && !targetPage.classList.contains('animated')) {
                setTimeout(() => {
                    targetPage.classList.add('animated');
                }, 500); // Match CSS animation duration
            }
        }

        // Update nav active state
        this.updateNav(page);

        // Update document title
        this.updateTitle(page);

        // Restore scroll position or go to top (INSTANT - no animation)
        const savedScroll = this.scrollPositions[page] || 0;
        window.scrollTo({ top: savedScroll, behavior: 'instant' });

        // Run page-specific init if needed
        this.initPage(page);

        // Reveal body (hidden by default to prevent flash)
        document.body.classList.add('ready');

        this.currentPage = page;
        console.log('[Router] Navigated to:', page);
    },

    updateNav(page) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href') || '';
            const linkPage = href.replace(/^\//, '').replace('.html', '') || 'home';
            if (linkPage === page) {
                link.classList.add('active');
            }
        });
    },

    updateTitle(page) {
        const titles = {
            'home': 'divisionzero - Where Ideas Become Reality Through AI',
            'projects': 'Projects | divisionzero',
            'tools': 'Tools | divisionzero',
            'dictionary': 'Dictionary | divisionzero',
            'submit': 'Submit | divisionzero'
        };
        document.title = titles[page] || titles['home'];
    },

    initPage(page) {
        // Call page-specific initialization function
        // Only run for the CURRENT page to avoid duplicate data fetches
        switch (page) {
            case 'home':
                if (typeof initHomePage === 'function') initHomePage();
                break;
            case 'projects':
                if (typeof initProjectsPage === 'function') initProjectsPage();
                break;
            case 'tools':
                if (typeof initToolsPage === 'function') initToolsPage();
                break;
            case 'dictionary':
                if (typeof initDictionaryPage === 'function') initDictionaryPage();
                break;
            case 'submit':
                if (typeof initSubmitPage === 'function') initSubmitPage();
                break;
        }
        console.log('[Router] Page init:', page);
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Router.init();
});

// Make globally available
window.Router = Router;
