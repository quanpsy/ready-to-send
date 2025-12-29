/* ============================================
   utils.js - Utility Functions
   ============================================
   
   🧰 SHARED HELPER FUNCTIONS
   
   Reusable functions used across the site.
   All functions are pure (no side effects) for reliability.
   
   SECTIONS:
   1. Formatting (numbers, dates, text)
   2. DOM Helpers
   3. Data Helpers
   4. Animation Helpers
   
   ============================================ */


// ============================================
// FORMATTING FUNCTIONS
// ============================================

/**
 * Format large numbers with K/M suffix
 * Example: 12500 → "12.5k"
 * 
 * @param {number} num - The number to format
 * @returns {string} Formatted string
 */
function formatViews(num) {
    if (num === null || num === undefined) return '0';

    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
}


/**
 * Format a date to relative time
 * Example: "2 days ago", "Just now"
 * 
 * @param {Date|string} date - The date to format
 * @returns {string} Relative time string
 */
function formatRelativeTime(date) {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return then.toLocaleDateString();
}


/**
 * Truncate text with ellipsis
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
}


// ============================================
// DOM HELPER FUNCTIONS
// ============================================

/**
 * Safely query a DOM element
 * Returns null if not found (no error)
 * 
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {Element|null}
 */
function $(selector, parent = document) {
    return parent.querySelector(selector);
}


/**
 * Safely query all DOM elements
 * Returns empty array if none found
 * 
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {Element[]}
 */
function $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
}


/**
 * Create a DOM element with attributes
 * 
 * @param {string} tag - Element tag name
 * @param {object} attrs - Attributes to set
 * @param {string} html - Inner HTML content
 * @returns {Element}
 */
function createElement(tag, attrs = {}, html = '') {
    const el = document.createElement(tag);

    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                el.dataset[dataKey] = dataValue;
            });
        } else {
            el.setAttribute(key, value);
        }
    });

    if (html) el.innerHTML = html;

    return el;
}


/**
 * Add event listener with auto-cleanup
 * 
 * @param {Element} el - Element to attach to
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {object} options - Event options
 */
function on(el, event, handler, options = {}) {
    if (!el) return;
    el.addEventListener(event, handler, options);
}


// ============================================
// DATA HELPER FUNCTIONS
// ============================================

/**
 * Safely get nested object property
 * Example: get(obj, 'user.profile.name', 'Anonymous')
 * 
 * @param {object} obj - Object to query
 * @param {string} path - Dot-notation path
 * @param {*} defaultValue - Default if not found
 * @returns {*}
 */
function get(obj, path, defaultValue = undefined) {
    return path.split('.').reduce((acc, part) => {
        return acc && acc[part] !== undefined ? acc[part] : defaultValue;
    }, obj);
}


/**
 * Debounce a function (delay execution)
 * Useful for search inputs, scroll handlers
 * 
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function}
 */
function debounce(fn, delay = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}


/**
 * Throttle a function (limit execution rate)
 * Useful for scroll/resize handlers
 * 
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Minimum time between calls (ms)
 * @returns {Function}
 */
function throttle(fn, limit = 100) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}


// JSON cache to prevent duplicate fetches
// We cache the PROMISE, not the result - this prevents race conditions
const jsonCache = {};

/**
 * Load JSON data from a file (with deduplication)
 * Concurrent calls for the same URL share a single fetch request
 * 
 * @param {string} url - Path to JSON file
 * @returns {Promise<object>}
 */
async function loadJSON(url) {
    // If there's already a pending or completed request, return it
    if (jsonCache[url]) {
        console.log('[utils] JSON cache hit:', url);
        return jsonCache[url];
    }

    // Cache the PROMISE immediately (before awaiting)
    // This way, any concurrent calls will get the same promise
    console.log('[utils] JSON fetching:', url);
    jsonCache[url] = fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${url}: ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error(`Error loading JSON from ${url}:`, error);
            // Remove from cache on error so retry is possible
            delete jsonCache[url];
            return null;
        });

    return jsonCache[url];
}


/**
 * Load site data from combined data.json
 * Returns a specific section (dictionary, icons, tools)
 * 
 * @param {string} section - Section to return: 'dictionary', 'icons', or 'tools'
 * @returns {Promise<object>}
 */
async function loadSiteData(section) {
    const data = await loadJSON('data/data.json');
    if (!data) return null;
    return data[section] || null;
}


// ============================================
// ANIMATION HELPER FUNCTIONS
// ============================================

/**
 * Smooth scroll to element
 * 
 * @param {string|Element} target - Element or selector
 * @param {number} offset - Offset from top (for fixed nav)
 */
function scrollToElement(target, offset = 100) {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
}


/**
 * Fade in an element
 * 
 * @param {Element} el - Element to fade in
 * @param {number} duration - Duration in ms
 */
function fadeIn(el, duration = 300) {
    if (!el) return;

    el.style.opacity = '0';
    el.style.display = 'block';

    let start = null;
    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / duration;

        el.style.opacity = Math.min(progress, 1);

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}


/**
 * Fade out an element
 * 
 * @param {Element} el - Element to fade out
 * @param {number} duration - Duration in ms
 */
function fadeOut(el, duration = 300) {
    if (!el) return;

    let start = null;
    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / duration;

        el.style.opacity = 1 - Math.min(progress, 1);

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            el.style.display = 'none';
        }
    }

    requestAnimationFrame(step);
}


// ============================================
// CLIPBOARD HELPER
// ============================================

/**
 * Copy text to clipboard
 * 
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy:', error);
        return false;
    }
}


/**
 * Show a toast notification
 * 
 * @param {string} message - Message to show
 * @param {number} duration - Duration in ms
 */
function showToast(message, duration = 3000) {
    // Remove existing toast
    const existingToast = $('.toast');
    if (existingToast) existingToast.remove();

    // Create new toast
    const toast = createElement('div', { className: 'toast' }, `
        <div class="toast-message">${message}</div>
    `);

    document.body.appendChild(toast);

    // Show with animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Hide after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}


// Make utilities available globally
window.utils = {
    formatViews,
    formatRelativeTime,
    truncateText,
    $,
    $$,
    createElement,
    on,
    get,
    debounce,
    throttle,
    loadJSON,
    loadSiteData,
    scrollToElement,
    fadeIn,
    fadeOut,
    copyToClipboard,
    showToast
};
