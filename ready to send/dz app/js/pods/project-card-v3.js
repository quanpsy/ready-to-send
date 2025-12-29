/* ============================================
   project-card-v3.js - Project Card Pod v3
   ============================================
   
   🔲 DESIGN 3: TOOL-CARD STYLING
   
   Same layout as v2 but with:
   - Tool-card font sizes (larger, more readable)
   - No "Built with:" / "Stack:" labels
   - Just pill tags for tools and stack
   
   ============================================ */


/**
 * Create a project card HTML string (Design v3)
 * 
 * @param {Object} project - Project data
 * @returns {string} HTML string for the card
 */
function createProjectCardV3(project = {}) {

    // ========================================
    // DEFAULTS - Handle missing data
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
    // GITHUB ICON
    // ========================================

    const githubHTML = github ? `
        <a href="${github}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="card-icon github-link" 
           title="View on GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
        </a>
    ` : '';


    // ========================================
    // DISCORD ICON
    // ========================================

    const discordHTML = `
        <a href="${discord}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="card-icon discord-mandatory" 
           title="Discord Thread">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
        </a>
    `;


    // ========================================
    // SAVE BUTTON
    // ========================================

    const saveHTML = `
        <button class="card-icon stat-save" 
                title="Save Project"
                onclick="saveProject('${name}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
        </button>
    `;


    // ========================================
    // SHARE BUTTON
    // ========================================

    const shareHTML = `
        <button class="card-icon stat-share" 
                title="Share Project"
                onclick="shareProject('${name}', '${vercelUrl}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
        </button>
    `;


    // ========================================
    // INLINE TOOLS - Max 2 items, no label
    // ========================================

    const displayTools = tools.slice(0, 2);
    const toolsHTML = displayTools.map(t => `<span class="tech-pill">${t}</span>`).join('');


    // ========================================
    // INLINE STACK - Max 2 items, no label
    // ========================================

    const displayTags = tags.slice(0, 2);
    const tagsHTML = displayTags.map(t => `<span class="tech-pill">${t}</span>`).join('');


    // ========================================
    // BUILDER LINK
    // ========================================

    const builderHTML = builder
        ? (builderUrl && builderUrl !== '#'
            ? `<a href="${builderUrl}" class="card-builder" target="_blank" rel="noopener noreferrer">@${builder}</a>`
            : `<span class="card-builder">@${builder}</span>`)
        : '';


    // ========================================
    // FINAL HTML BUILD
    // ========================================

    return `
        <article class="project-card-v3" style="--glow-color: ${glowColor}">
            <div class="card-wrapper">
            
                <!-- TOP: Badge -->
                <div class="card-top">
                    ${badgeHTML}
                </div>
                
                <!-- HEADER: Logo + Title -->
                <div class="card-header">
                    <a href="${vercelUrl}" target="_blank" rel="noopener noreferrer" class="card-logo-link">
                        <img src="${logo}" alt="${name} logo" class="card-logo" loading="lazy">
                    </a>
                    <div class="card-header-info">
                        <a href="${vercelUrl}" target="_blank" rel="noopener noreferrer" class="card-title-link">
                            <h3 class="card-title">${name}</h3>
                        </a>
                        <span class="card-views">${utils.formatViews(views)} views</span>
                    </div>
                </div>
                
                <!-- DESCRIPTION -->
                <p class="card-description">${description}</p>
                
                <!-- TECH PILLS: Tools + Stack -->
                <div class="card-tech-pills">
                    ${toolsHTML}
                    ${tagsHTML}
                </div>
                
                <!-- FOOTER: Builder + Icons -->
                <div class="card-footer">
                    ${builderHTML}
                    <div class="card-icons">
                        ${githubHTML}
                        ${discordHTML}
                        ${saveHTML}
                        ${shareHTML}
                    </div>
                </div>
                
            </div>
        </article>
    `;
}


// Make functions available globally
window.createProjectCardV3 = createProjectCardV3;
