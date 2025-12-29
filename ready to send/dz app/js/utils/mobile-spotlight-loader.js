/* ============================================
   mobile-spotlight-loader.js - Auto Loader
   ============================================
   
   This script automatically loads the mobile 
   spotlight CSS and JS files.
   
   Just add this one script to any page:
   <script src="js/utils/mobile-spotlight-loader.js"></script>
   
   ============================================ */

(function () {
    // Only run on touch/mobile devices
    const isMobile = ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (window.innerWidth <= 768);

    if (!isMobile) return;

    // Add CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/utils/mobile-spotlight.css';
    document.head.appendChild(link);

    // Add JS
    const script = document.createElement('script');
    script.src = 'js/utils/mobile-spotlight.js';
    document.body.appendChild(script);
})();
