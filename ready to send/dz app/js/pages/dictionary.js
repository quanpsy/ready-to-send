/* ============================================
   dictionary.js - Dictionary Page Script
   ============================================
   
   📄 DICTIONARY PAGE INITIALIZATION
   
   This script runs on dictionary.html.
   It handles:
   - Loading dictionary terms
   - Rendering term cards
   - Search and filter
   - Term modal
   
   ============================================ */


// Store loaded terms data
let dictionaryData = null;
let allTerms = [];
let dictionaryPageInitialized = false;


/**
 * Initialize the dictionary page
 */
async function initDictionaryPage() {
    // Prevent re-initialization
    if (dictionaryPageInitialized) {
        console.log('[Dictionary] Already initialized, skipping');
        return;
    }
    dictionaryPageInitialized = true;

    // Load and render terms
    await loadAndRenderTerms();

    // Initialize search
    initTermSearch();

    // Initialize modal handlers
    initTermModal();

    // Animation handled by CSS (see esbuild template pageOpen keyframe)
}


/**
 * Load dictionary data and render terms
 */
async function loadAndRenderTerms() {
    const container = document.getElementById('terms-container');
    if (!container) return;

    // Load data from combined data.json
    dictionaryData = await utils.loadSiteData('dictionary');

    if (!dictionaryData) {
        container.innerHTML = `
            <div class="no-results">
                <h3>Unable to load dictionary</h3>
                <p>Please try again later.</p>
            </div>
        `;
        return;
    }

    // Flatten all terms into single array
    allTerms = Object.values(dictionaryData).flat();

    // Render all terms
    renderTerms(allTerms);
}


/**
 * Render terms to the container
 * 
 * @param {Object[]} terms - Array of terms to render
 */
function renderTerms(terms) {
    const container = document.getElementById('terms-container');
    if (!container) return;

    if (terms.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                </svg>
                <h3>No Terms Found</h3>
                <p>Try a different search</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="terms-grid">
            ${terms.map(term => createTermCard(term)).join('')}
        </div>
    `;
}


/**
 * Initialize search functionality
 */
function initTermSearch() {
    const searchInput = document.getElementById('term-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', utils.debounce((e) => {
        const query = e.target.value.toLowerCase().trim();

        if (!query) {
            renderTerms(allTerms);
            return;
        }

        const filtered = allTerms.filter(term =>
            term.name.toLowerCase().includes(query) ||
            term.definition.toLowerCase().includes(query) ||
            term.category.toLowerCase().includes(query)
        );

        renderTerms(filtered);
    }, 300));
}


/**
 * Initialize term modal functionality
 */
function initTermModal() {

    // Handler for opening modal
    window.handleOpenTermModal = function (termId) {
        const term = allTerms.find(t => t.id === termId);
        if (!term) return;

        const modal = document.getElementById('term-modal');
        const modalBody = modal?.querySelector('.modal-content');

        if (!modal || !modalBody) return;

        // Populate modal
        modalBody.innerHTML = `
            <button class="modal-close" onclick="closeTermModal()">&times;</button>
            ${createTermModalContent(term)}
        `;

        // Show modal
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    // Handler for copying prompt
    window.handleCopyPrompt = function (termId) {
        const term = allTerms.find(t => t.id === termId);
        if (!term || !term.prompt) return;

        utils.copyToClipboard(term.prompt);
        utils.showToast('Prompt copied to clipboard!');
    };

    // Close modal on backdrop click
    const modal = document.getElementById('term-modal');
    if (modal) {
        modal.querySelector('.modal-backdrop')?.addEventListener('click', closeTermModal);
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeTermModal();
        }
    });
}


/**
 * Close the term modal
 */
function closeTermModal() {
    const modal = document.getElementById('term-modal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}


// Make close function global
window.closeTermModal = closeTermModal;


// NOTE: initDictionaryPage is called by Router when navigating to dictionary page
// DO NOT add DOMContentLoaded listener here - Router handles page initialization
window.initDictionaryPage = initDictionaryPage;
