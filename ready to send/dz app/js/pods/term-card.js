/* ============================================
   term-card.js - Dictionary Term Card Pod
   ============================================
   
   🔲 ISOLATED COMPONENT: TERM CARD
   
   Creates HTML for dictionary term cards.
   
   TO EDIT TERM CARDS:
   - Styling: css/pods/term-card.css
   - Structure: Edit functions below
   
   ============================================ */


/**
 * Create a term card HTML string
 * 
 * @param {Object} term - Term data
 * @param {string} term.id - Unique term ID
 * @param {string} term.name - Term name
 * @param {string} term.icon - Emoji icon
 * @param {string} term.category - Term category
 * @param {string} term.definition - Full definition
 * 
 * @returns {string} HTML string for the card
 */
function createTermCard(term = {}) {

    // ========================================
    // DEFAULTS
    // ========================================

    const {
        id = '',
        name = 'Term',
        icon = '📝',
        category = 'General',
        definition = 'No definition available.'
    } = term;

    // Truncate definition for preview
    const preview = definition.length > 80
        ? definition.slice(0, 80) + '...'
        : definition;

    return `
        <div class="term-card glass" 
             data-term-id="${id}"
             onclick="openTermModal('${id}')">
            
            <!-- ICON -->
            <span class="term-icon">${icon}</span>
            
            <!-- NAME -->
            <h3 class="term-name">${name}</h3>
            
            <!-- CATEGORY BADGE -->
            <span class="term-category">${category}</span>
            
            <!-- PREVIEW -->
            <p class="term-preview">${preview}</p>
            
            <!-- ACTION -->
            <span class="term-action">Learn More →</span>
            
        </div>
    `;
}


/**
 * Create a term pill for scrolling rows
 * 
 * @param {Object} term - Term data
 * @returns {string} HTML string for the pill
 */
function createTermPill(term = {}) {

    const { id = '', name = 'Term', icon = '📝' } = term;

    return `
        <div class="term-pill" 
             data-term-id="${id}"
             onclick="openTermModal('${id}')">
            <span class="term-pill-icon">${icon}</span>
            <span class="term-pill-name">${name}</span>
        </div>
    `;
}


/**
 * Create a rating bar with 10 dots (broken 7 easter egg)
 */
function createTermRatingBar(value = 5, label = "Difficulty") {
    let dots = "";
    for (let i = 1; i <= 10; i++) {
        const isFilled = i <= value;
        const isBroken = i === 7;

        if (isBroken) {
            dots += `<span class="rating-dot broken ${isFilled ? 'filled' : ''}" title="The forbidden number"></span>`;
        } else {
            dots += `<span class="rating-dot ${isFilled ? 'filled' : ''}"></span>`;
        }
    }

    return `
        <div class="rating-row">
            <span class="rating-label">${label}</span>
            <div class="rating-dots">${dots}</div>
        </div>
    `;
}


/**
 * Create a term modal HTML
 * 
 * @param {Object} term - Full term data
 * @returns {string} HTML string for the modal
 */
function createTermModalContent(term = {}) {

    const {
        name = 'Term',
        icon = '📝',
        category = 'General',
        definition = '',
        useCase = '',
        example = '',
        prompt = '',
        difficulty = 5
    } = term;

    // Generate difficulty rating HTML
    const difficultyHTML = createTermRatingBar(difficulty, 'Difficulty');

    return `
        <div class="modal-header">
            <span class="modal-icon">${icon}</span>
            <h2 class="modal-title">${name}</h2>
            <span class="modal-subtitle">${category}</span>
        </div>
        
        <div class="modal-body">
            
            <!-- DIFFICULTY RATING -->
            <div class="term-section term-ratings">
                ${difficultyHTML}
            </div>
            
            <!-- DEFINITION -->
            <div class="term-section">
                <h4 class="term-section-title">What is it?</h4>
                <p class="term-definition">${definition}</p>
            </div>
            
            ${useCase ? `
            <!-- USE CASE -->
            <div class="term-section">
                <h4 class="term-section-title">When to use it</h4>
                <p class="term-definition">${useCase}</p>
            </div>
            ` : ''}
            
            ${example ? `
            <!-- EXAMPLE -->
            <div class="term-section">
                <h4 class="term-section-title">Example</h4>
                <p class="term-definition">${example}</p>
            </div>
            ` : ''}
            
            ${prompt ? `
            <!-- AI PROMPT -->
            <div class="term-section">
                <h4 class="term-section-title">AI Prompt</h4>
                <div class="term-prompt">${prompt}</div>
                <button class="btn-secondary copy-prompt-btn" 
                        onclick="copyPrompt('${term.id}')">
                    Copy Prompt
                </button>
            </div>
            ` : ''}
            
        </div>
    `;
}


/**
 * Open a term modal
 * 
 * @param {string} termId - The term ID to open
 */
function openTermModal(termId) {
    // This will be called from dictionary.js which has access to term data
    if (window.handleOpenTermModal) {
        window.handleOpenTermModal(termId);
    }
}


/**
 * Copy a term's prompt to clipboard
 * 
 * @param {string} termId - The term ID
 */
function copyPrompt(termId) {
    if (window.handleCopyPrompt) {
        window.handleCopyPrompt(termId);
    }
}


// Make functions available globally
window.createTermCard = createTermCard;
window.createTermPill = createTermPill;
window.createTermModalContent = createTermModalContent;
window.openTermModal = openTermModal;
window.copyPrompt = copyPrompt;
