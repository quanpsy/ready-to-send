/* ============================================
   tools.js - Tools Page Script
   ============================================
   
   📄 TOOLS PAGE INITIALIZATION
   
   This script runs on tools.html.
   It handles:
   - Loading tools data
   - Rendering tool categories and cards
   
   ============================================ */


// Track if page was already initialized
let toolsPageInitialized = false;

/**
 * Initialize the tools page
 */
async function initToolsPage() {
    // Prevent re-initialization (saves edge requests)
    if (toolsPageInitialized) {
        console.log('[Tools] Already initialized, skipping');
        return;
    }
    toolsPageInitialized = true;

    // Load and render tools
    await loadAndRenderTools();

    // Animation handled by CSS (see esbuild template pageOpen keyframe)
}


/**
 * Load tools data and render categories
 */
async function loadAndRenderTools() {
    const container = document.getElementById('tools-container');
    if (!container) return;

    // Load data from combined data.json
    const toolsData = await utils.loadSiteData('tools');

    if (!toolsData) {
        container.innerHTML = `
            <div class="no-results">
                <h3>Unable to load tools</h3>
                <p>Please try again later.</p>
            </div>
        `;
        return;
    }

    // Define categories to show (in order) - matches curated-tools.json
    const categories = [
        { id: 'ai_chatbots', title: 'AI Chatbots', description: 'Your coding co-pilots. Describe what you want, they write the code.' },
        { id: 'code_editors', title: 'Code Editors', description: 'AI-powered editors that understand your intent.' },
        { id: 'no_code_builders', title: 'No-Code Builders', description: 'Build full apps without writing code. AI does the heavy lifting.' },
        { id: 'frontend', title: 'Frontend Frameworks', description: 'Libraries for building user interfaces.' },
        { id: 'backend', title: 'Backend', description: 'Server-side frameworks and runtimes.' },
        { id: 'database', title: 'Database & Auth', description: 'Store data and manage users without writing backend code.' },
        { id: 'hosting', title: 'Hosting', description: 'Deploy your apps to the world with one click.' },
        { id: 'design', title: 'Design Tools', description: 'Create stunning visuals with AI.' },
        { id: 'utilities', title: 'Utilities', description: 'Essential tools for developers.' }
    ];

    // Render each category
    categories.forEach(category => {
        // Access tools array from category object (curated-tools.json structure)
        const categoryData = toolsData[category.id];
        const tools = categoryData?.tools || categoryData;

        if (tools && tools.length > 0) {
            const sectionHTML = createToolsCategory(category, tools);
            container.insertAdjacentHTML('beforeend', sectionHTML);
        }
    });

    // Initialize broken 7 flicker effect
    if (window.initBroken7Flicker) {
        setTimeout(initBroken7Flicker, 100);
    }
}


// NOTE: initToolsPage is called by Router when navigating to tools page
// DO NOT add DOMContentLoaded listener here - Router handles page initialization
window.initToolsPage = initToolsPage;
