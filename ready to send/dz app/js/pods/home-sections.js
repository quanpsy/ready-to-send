/* ============================================
   home-sections.js - Home Page Special Sections
   ============================================
   
   🏠 HOME PAGE FEATURES
   
   Handles:
   1. Vocabulary Term Rows with tooltips
   2. Stack/Tool Logo infinite loop
   
   ============================================ */


/**
 * Initialize home page special sections
 * Call this from home.js
 */
function initHomeSections() {
    renderTermRows();
    renderLogoLoop();
}


/**
 * Render 3 rows of vocabulary terms
 */
async function renderTermRows() {
    const container = document.getElementById('term-scroll-container');
    if (!container) return;

    // Load dictionary data from combined data.json
    const data = await utils.loadSiteData('dictionary');
    if (!data) return;

    // Flatten all terms into single array
    const allTerms = Object.values(data).flat();

    // Shuffle for variety
    const shuffled = [...allTerms].sort(() => Math.random() - 0.5);

    // Split into 3 rows
    const rowSize = Math.ceil(shuffled.length / 3);
    const rows = [
        shuffled.slice(0, rowSize),
        shuffled.slice(rowSize, rowSize * 2),
        shuffled.slice(rowSize * 2)
    ];

    // Create 3 row elements
    rows.forEach((rowTerms, index) => {
        const row = document.createElement('div');
        row.className = 'term-scroll-row' + (index === 2 ? ' reverse' : '');
        row.id = `term-row-${index + 1}`;

        // Triple duplicate terms for seamless loop
        const pills = [...rowTerms, ...rowTerms, ...rowTerms].map(term => createTermPillWithTooltip(term)).join('');
        row.innerHTML = pills;

        container.appendChild(row);
    });
}


/**
 * Create a term pill with tooltip
 * 
 * @param {Object} term - Term data with name, icon, definition
 * @returns {string} HTML string
 */
function createTermPillWithTooltip(term) {
    const { name = 'Term', icon = '📝', definition = 'No definition.' } = term;

    // Truncate definition for tooltip
    const shortDef = definition.length > 120
        ? definition.slice(0, 120) + '...'
        : definition;

    return `
        <div class="term-scroll-pill">
            <span class="pill-icon">${icon}</span>
            <span class="pill-name">${name}</span>
            <div class="term-tooltip">
                <div class="term-tooltip-title">${name}</div>
                <div class="term-tooltip-definition">${shortDef}</div>
            </div>
        </div>
    `;
}


/**
 * Render infinite logo loop for tools/stacks
 */
async function renderLogoLoop() {
    const track = document.getElementById('logo-scroll-track');
    if (!track) return;

    // Load icons data from combined data.json
    const data = await utils.loadSiteData('icons');
    if (!data) return;

    // Combine tools and stacks
    const allIcons = [...(data.tools || []), ...(data.stacks || [])];

    // Create image elements (tripled for seamless loop)
    const iconsHTML = [...allIcons, ...allIcons, ...allIcons].map(item =>
        `<img src="${item.icon}" alt="${item.name}" title="${item.name}">`
    ).join('');

    track.innerHTML = iconsHTML;
}


// Make function available globally
window.initHomeSections = initHomeSections;
