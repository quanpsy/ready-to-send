/* ============================================
   project-card.js - Project Card Pod
   ============================================
   
   🔲 ISOLATED COMPONENT: PROJECT CARD
   
   This file ONLY handles creating project card HTML.
   It's a pure function - give it data, get HTML back.
   
   TO EDIT PROJECT CARDS:
   - Styling: css/pods/project-card.css
   - Structure: Edit createProjectCard() below
   
   ============================================ */


/**
 * Create a project card HTML string
 * 
 * This is the ONLY function for creating project cards.
 * It handles missing data gracefully (no crashes).
 * 
 * @param {Object} project - Project data
 * @param {string} project.name - Project name
 * @param {string} project.description - Short description
 * @param {string} project.logo - Logo image URL
 * @param {string} project.vercelUrl - Link to live project
 * @param {number} project.views - View count
 * @param {string[]} project.tags - Tech stack tags
 * @param {string[]} project.tools - AI tools used
 * @param {string} project.category - Project category
 * @param {string} project.github - GitHub repo URL (optional)
 * @param {string} project.discord - Discord thread URL (optional)
 * @param {string} project.builder - Builder username (optional)
 * @param {string} project.builderUrl - Builder profile URL (optional)
 * @param {boolean} project.promoted - Is promoted?
 * @param {boolean} project.new - Is new?
 * 
 * @returns {string} HTML string for the card
 */
function createProjectCard(project = {}) {

    // ========================================
    // DEFAULTS - Handle missing data
    // ----------------------------------------
    // These defaults prevent crashes
    // ========================================

    const {
        name = 'Untitled Project',
        description = 'No description available.',
        logo = 'https://via.placeholder.com/80x80/8b5cf6/ffffff?text=?',
        vercelUrl = '#',
        views = 0,
        tags = [],
        tools = [],
        category = 'default',
        github = '',
        discord = '#',
        builder = '',
        builderUrl = '#',
        promoted = false,
        isNew = false
    } = project;


    // ========================================
    // GLOW COLOR - Based on category
    // ========================================

    const glowColor = CONFIG.CATEGORY_COLORS[category] ||
        CONFIG.CATEGORY_COLORS.default;


    // ========================================
    // BADGE - Star badge for promoted/new
    // ========================================

    const badgeHTML = (promoted || isNew) ? `
        <span class="card-badge" title="${promoted ? 'Promoted' : 'New'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
        </span>
    ` : '';


    // ========================================
    // GITHUB ICON - Only if URL provided
    // ========================================

    const githubHTML = github ? `
        <a href="${github}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="card-icon github-link" 
           title="View on GitHub">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
        </a>
    ` : '';


    // ========================================
    // DISCORD ICON - Always shown
    // ========================================

    const discordHTML = `
        <a href="${discord}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="card-icon discord-mandatory" 
           title="Discord Thread">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
        </a>
    `;


    // ========================================
    // SHARE BUTTON
    // ========================================

    const shareHTML = `
        <button class="card-icon stat-share" 
                title="Share Project"
                onclick="shareProject('${name}', '${vercelUrl}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
        </button>
    `;


    // ========================================
    // SAVE BUTTON - Instagram-style bookmark
    // ========================================

    const saveHTML = `
        <button class="card-icon stat-save" 
                title="Save Project"
                onclick="saveProject('${name}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
        </button>
    `;


    // ========================================
    // TOOLS ROW - AI tools used
    // ========================================

    const toolsHTML = tools.length > 0 ? `
        <div class="card-tech-row">
            <span class="tech-label">Built with:</span>
            ${tools.map(t => `<span class="tech-item">${t}</span>`).join('')}
        </div>
    ` : '';


    // ========================================
    // TAGS ROW - Tech stack
    // ========================================

    const tagsHTML = tags.length > 0 ? `
        <div class="card-tech-row">
            <span class="tech-label">Stack:</span>
            ${tags.map(t => `<span class="tech-item">${t}</span>`).join('')}
        </div>
    ` : '';


    // ========================================
    // BUILDER LINK
    // ========================================

    const builderHTML = builder
        ? `<a href="${builderUrl}" target="_blank" class="card-builder">@${builder}</a>`
        : `<span class="card-builder">@builder</span>`;


    // ========================================
    // FINAL CARD HTML
    // ----------------------------------------
    // Assemble all parts into complete card
    // ========================================

    return `
        <div class="project-card" style="--glow-color: ${glowColor}">
            <div class="card-wrapper">
                
                <!-- TOP: Badge area -->
                <div class="card-top">${badgeHTML}</div>
                
                <!-- MAIN: Logo + Info -->
                <div class="card-main">
                    
                    <!-- LEFT: Logo -->
                    <div class="card-left">
                        <a href="${vercelUrl}" target="_blank" class="card-logo-link">
                            <div class="card-logo">
                                <img src="${logo}" alt="${name} Logo">
                            </div>
                        </a>
                    </div>
                    
                    <!-- RIGHT: Info -->
                    <div class="card-info">
                        
                        <!-- Title -->
                        <a href="${vercelUrl}" target="_blank" class="card-title-link">
                            <h3 class="card-title">${name}</h3>
                        </a>
                        
                        <!-- Description -->
                        <p class="card-description">${description}</p>
                        
                        <!-- Meta: Views + Builder -->
                        <div class="card-meta">
                            <span class="stat-views">${utils.formatViews(views)} views</span>
                            ${builderHTML}
                        </div>
                        
                        <!-- Icons: GitHub, Discord, Save, Share -->
                        <div class="card-icons-row">
                            <div class="card-icons">
                                ${githubHTML}
                                ${discordHTML}
                                ${saveHTML}
                                ${shareHTML}
                            </div>
                        </div>
                        
                    </div>
                </div>
                
                <!-- TECH: Expandable on hover -->
                <div class="card-tech">
                    ${toolsHTML}
                    ${tagsHTML}
                </div>
                
            </div>
        </div>
    `;
}


/**
 * Share a project (copy link to clipboard)
 * 
 * @param {string} name - Project name
 * @param {string} url - Project URL
 */
function shareProject(name, url) {
    utils.copyToClipboard(url);
    utils.showToast(`Copied link for "${name}"!`);
}


/**
 * Save a project (bookmark for later)
 * Stores in localStorage
 * 
 * @param {string} name - Project name
 */
function saveProject(name) {
    // Get saved projects from localStorage
    let saved = JSON.parse(localStorage.getItem('savedProjects') || '[]');

    // Check if already saved
    if (saved.includes(name)) {
        // Unsave it
        saved = saved.filter(p => p !== name);
        localStorage.setItem('savedProjects', JSON.stringify(saved));
        utils.showToast(`Removed "${name}" from saved`);
    } else {
        // Save it
        saved.push(name);
        localStorage.setItem('savedProjects', JSON.stringify(saved));
        utils.showToast(`Saved "${name}"!`);
    }
}


// Make functions available globally
window.createProjectCard = createProjectCard;
window.shareProject = shareProject;
window.saveProject = saveProject;
