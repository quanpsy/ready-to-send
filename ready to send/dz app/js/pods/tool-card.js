/* ============================================
   tool-card.js - Tool Card Pod
   ============================================
   
   🔲 ISOLATED COMPONENT: TOOL CARD
   
   Creates HTML for tool cards on Tools page.
   
   TO EDIT TOOL CARDS:
   - Styling: css/pods/tool-card.css
   - Structure: Edit createToolCard() below
   
   ============================================ */


/**
 * Create a tool card HTML string
 * 
 * @param {Object} tool - Tool data
 * @param {string} tool.name - Tool name
 * @param {string} tool.description - Description
 * @param {string} tool.logo - Logo URL
 * @param {string} tool.url - Tool website URL
 * @param {string[]} tool.features - Feature list
 * @param {string} tool.skillLevel - Required skill level
 * @param {string} tool.pricing - Pricing info
 * 
 * @returns {string} HTML string for the card
 */
function createToolCard(tool = {}) {

    // ========================================
    // DEFAULTS - Handle missing data
    // Support both old schema (logo, url) and new schema (icon, website)
    // ========================================

    const {
        name = 'Tool Name',
        description = 'No description available.',
        icon,
        logo,
        website,
        url,
        difficulty = 5,
        capability = 5,
        free_tier = true,
        features = []
    } = tool;

    // Backwards compatibility: prefer new field names, fall back to old
    const toolIcon = icon || logo || 'https://via.placeholder.com/60x60/8b5cf6/ffffff?text=?';
    const toolUrl = website || url || '#';


    // ========================================
    // FEATURES - Badge list
    // ========================================

    const featuresHTML = features.length > 0
        ? features.map(f => `<span class="feature-badge">${f}</span>`).join('')
        : '';


    // ========================================
    // RATING BARS - The "Broken 7" Easter Egg
    // 10 circles, 7th is always broken/flickering
    // ========================================

    function createRatingBar(value, label) {
        let dots = '';
        for (let i = 1; i <= 10; i++) {
            const isFilled = i <= value;
            const isBroken = i === 7;

            if (isBroken) {
                // The broken 7th circle - random flicker ID for each
                const flickerId = `flicker-${Math.random().toString(36).substr(2, 9)}`;
                dots += `<span class="rating-dot broken" id="${flickerId}"></span>`;
            } else if (isFilled) {
                dots += `<span class="rating-dot filled"></span>`;
            } else {
                dots += `<span class="rating-dot empty"></span>`;
            }
        }
        return `
            <div class="rating-row">
                <span class="rating-label">${label}</span>
                <div class="rating-dots">${dots}</div>
            </div>
        `;
    }

    const difficultyHTML = createRatingBar(difficulty, 'Difficulty');
    const capabilityHTML = createRatingBar(capability, 'Capability');


    // ========================================
    // FINAL CARD HTML
    // ========================================

    return `
        <div class="tool-card glass">
            
            <!-- HEADER: Logo + Name + Skill -->
            <div class="tool-header">
            <img src="${toolIcon}" 
                     alt="${name}" 
                     class="tool-logo"
                     onerror="this.onerror=null; this.src='/assets/images/white-logo.svg'">
                <div>
                    <h3 class="tool-name">${name}</h3>
                    <span class="tool-skill">${free_tier ? '✓ Free tier' : 'Paid only'}</span>
                </div>
            </div>
            
            <!-- DESCRIPTION -->
            <p class="tool-description">${description}</p>
            
            <!-- RATINGS -->
            <div class="tool-ratings">
                ${difficultyHTML}
                ${capabilityHTML}
            </div>
            
            <!-- FOOTER: Link -->
            <div class="tool-footer">
                <a href="${toolUrl}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="tool-link">
                    Visit →
                </a>
            </div>
            
        </div>
    `;
}


/**
 * Create a tools category section
 * 
 * @param {Object} category - Category data
 * @param {string} category.id - Category ID
 * @param {string} category.title - Category title
 * @param {string} category.description - Category description
 * @param {Object[]} tools - Array of tools in this category
 * 
 * @returns {string} HTML string for the category section
 */
function createToolsCategory(category, tools) {

    if (!tools || tools.length === 0) return '';

    const toolCardsHTML = tools.map(tool => createToolCard(tool)).join('');

    return `
        <div class="tools-category" id="category-${category.id}">
            
            <!-- CATEGORY HEADER -->
            <div class="category-header">
                <h2 class="category-title">${category.title}</h2>
                <p class="category-description">${category.description}</p>
            </div>
            
            <!-- TOOLS GRID -->
            <div class="tools-grid">
                ${toolCardsHTML}
            </div>
            
        </div>
    `;
}


// Make functions available globally
window.createToolCard = createToolCard;
window.createToolsCategory = createToolsCategory;


/**
 * Randomize flicker delays for broken 7 dots
 * Called after tool cards are rendered to add random animation delays
 */
function initBroken7Flicker() {
    const brokenDots = document.querySelectorAll('.rating-dot.broken');
    brokenDots.forEach(dot => {
        // Random delay between 0-5 seconds
        const delay = Math.random() * 5;
        dot.style.animationDelay = `${delay}s`;

        // Also randomize animation duration slightly (2.5-3.5s)
        const duration = 2.5 + Math.random();
        dot.style.animationDuration = `${duration}s`;
    });
}

// Run after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for tool cards to render
    setTimeout(initBroken7Flicker, 500);
});

window.initBroken7Flicker = initBroken7Flicker;
