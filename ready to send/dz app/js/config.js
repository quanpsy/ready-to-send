/* ============================================
   config.js - Site Configuration
   ============================================
   
   🎛️ CENTRAL CONFIGURATION FILE
   
   All site-wide settings are defined here.
   Change a value here → updates across the entire site.
   
   SECTIONS:
   1. Site Info
   2. External URLs
   3. Feature Flags
   4. UI Settings
   
   ============================================ */


const CONFIG = {

    // ========================================
    // SITE INFO
    // ========================================
    SITE_NAME: 'divisionzero',
    SITE_TAGLINE: 'Where Ideas Become Reality Through AI',


    // ========================================
    // EXTERNAL URLs
    // ----------------------------------------
    // Change these when you have real URLs
    // ========================================
    DISCORD_URL: 'https://discord.gg/SXJS4S7jUE',
    TWITTER_URL: 'https://twitter.com/divisionzerodev',
    REDDIT_URL: 'https://reddit.com/r/divisionzero',
    GITHUB_URL: 'https://github.com/divisionzero',


    // ========================================
    // FORM SUBMISSION
    // ----------------------------------------
    // Where forms submit to (Discord webhook, Formspree, etc.)
    // Leave empty to disable form submission
    // ========================================
    SUBMIT_WEBHOOK_URL: '',  // TODO: Add Discord webhook URL
    IDEA_WEBHOOK_URL: '',    // TODO: Add idea submission webhook


    // ========================================
    // EXTERNAL DATABASE LINKS
    // ----------------------------------------
    // Links to full databases (Notion, Airtable, etc.)
    // ========================================
    FULL_PROJECTS_DATABASE_URL: '#',  // TODO: Add full projects database link
    FULL_DICTIONARY_LIBRARY_URL: '#', // TODO: Add full dictionary library link


    // ========================================
    // DATA SETTINGS
    // ----------------------------------------
    // Cloudflare Worker API for projects
    // ========================================
    WORKER_API_URL: 'https://divisionzero-sync.rndmprsn77.workers.dev',
    DATA_REFRESH_HOURS: 1,       // Cron runs every 1 hour
    MAX_CAROUSEL_ITEMS: 20,      // Max items per carousel
    MAX_FEATURED_PROJECTS: 10,   // Max promoted/featured projects


    // ========================================
    // UI SETTINGS
    // ========================================
    ANIMATION_DURATION: 300,     // Base animation speed (ms)
    SCROLL_OFFSET: 100,          // Offset for smooth scroll
    MOBILE_BREAKPOINT: 768,      // Mobile breakpoint (px)


    // ========================================
    // CATEGORY COLORS
    // ----------------------------------------
    // Glow colors for different project categories
    // ========================================
    CATEGORY_COLORS: {
        'Productivity': '#8b5cf6',
        'Developer Tools': '#06b6d4',
        'Design': '#ec4899',
        'Utilities': '#14b8a6',
        'Games': '#f59e0b',
        'AI Agents': '#8b5cf6',
        'default': '#8b5cf6'
    },


    // ========================================
    // NAVIGATION LINKS
    // ----------------------------------------
    // Links shown in the nav bar
    // ========================================
    NAV_LINKS: [
        { name: 'Home', href: '/', id: 'home' },
        { name: 'Projects', href: '/projects', id: 'projects' },
        { name: 'Tools', href: '/tools', id: 'tools' },
        { name: 'Dictionary', href: '/dictionary', id: 'dictionary' },
        { name: 'Submit', href: '/submit', id: 'submit' }
    ]
};


// Make config available globally
// (In a module system, you would export this instead)
window.CONFIG = CONFIG;
